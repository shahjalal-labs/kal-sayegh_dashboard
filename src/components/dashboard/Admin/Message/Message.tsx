/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  MoreVertical,
  Plus,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { toast } from "sonner";

import defaultProfileImage from "@/assets/dashboard/profile.png";
import {
  useGenerateUrlMutation,
  useInviteGroupMutation,
} from "@/redux/api/admin/messageApi";
import { useMyProfileQuery } from "@/redux/api/authApi";
import { useGetAllUsersQuery } from "@/redux/api/userApi";
import ChatSidebar from "./ChatSidebar";

type ChatMessage = {
  id: number;
  userId: string;
  senderId?: string;
  content: string;
  fileUrl?: string[];
  timestamp?: string;
  partner?: {
    fullName: string;
    profileImage?: string;
  };
};

type MemberConversation = {
  roomId: string;
  roomName?: string;
  roomPhoto?: string;
  roomType?: string;
  members?: Array<{
    id: string;
    fullName: string;
    profileImage?: string | null;
    isActive?: boolean;
  }>;
  partner?: {
    id: string;
    fullName: string;
    profileImage?: string | null;
    isActive?: boolean;
  };
  lastMessage?: {
    content?: string;
    createdAt?: string;
  };
  unreadCount: number;
};

export default function Message() {
  const [selectedRoom, setSelectedRoom] = useState("Select a chat");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<MemberConversation | null>(null);
  const [memberConversations, setMemberConversations] = useState<
    MemberConversation[]
  >([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([]);
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteMemberIds, setInviteMemberIds] = useState<string[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: profileData } = useMyProfileQuery({});

  const [generateUrlFn] = useGenerateUrlMutation();
  const [inviteMemberGroupFn, { isLoading: isInvitingMembers }] =
    useInviteGroupMutation();
  const { data: usersData } = useGetAllUsersQuery({});

  const currentUserId: string | undefined = profileData?.result?.id;
  const currentUserImage: string | undefined =
    profileData?.result?.profileImage || undefined;
  const allUsers = usersData?.result || [];

  const isValidUrl = (url?: string | null) => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getConversationTitle = (conv?: MemberConversation | null) => {
    if (!conv) return selectedRoom;
    const isGroup = (conv.roomType || "").toLowerCase() === "group";
    if (isGroup) {
      return conv.roomName || "Group";
    }
    return (
      conv.partner?.fullName ||
      conv.members?.find((member) => member.id !== currentUserId)?.fullName ||
      "Unknown"
    );
  };

  const getConversationAvatar = (conv?: MemberConversation | null) => {
    if (!conv) return null;
    const isGroup = (conv.roomType || "").toLowerCase() === "group";
    if (isGroup && isValidUrl(conv.roomPhoto)) {
      return conv.roomPhoto as string;
    }
    if (isValidUrl(conv.partner?.profileImage)) {
      return conv.partner?.profileImage as string;
    }
    const otherMember = conv.members?.find(
      (member) => member.id !== currentUserId,
    );
    if (isValidUrl(otherMember?.profileImage)) {
      return otherMember?.profileImage as string;
    }
    return null;
  };

  const getConversationMeta = (conv?: MemberConversation | null) => {
    if (!conv) return "Select a conversation";
    const isGroup = (conv.roomType || "").toLowerCase() === "group";
    if (isGroup) {
      const memberCount = conv.members?.length || 0;
      const onlineCount =
        conv.members?.filter((member) => member.isActive).length || 0;
      return `${memberCount} members, ${onlineCount} online`;
    }
    return conv.partner?.isActive ? "Online" : "Offline";
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "pm" : "am";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch (error) {
      return timestamp;
    }
  };

  const getFileNameFromUrl = (url: string) => {
    try {
      return decodeURIComponent(url.split("/").pop() || "Attachment");
    } catch {
      return "Attachment";
    }
  };

  const isImageFileUrl = (url: string) => {
    try {
      const cleanUrl = url.split("?")[0].toLowerCase();
      return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(cleanUrl);
    } catch {
      return false;
    }
  };

  const normalizeMessage = (msg: any, fallbackId: number): ChatMessage => ({
    id: msg?.id ? String(msg.id).length + fallbackId : fallbackId,
    userId: msg?.senderId || msg?.userId || msg?.sender?.id || "",
    senderId: msg?.senderId || msg?.sender?.id || msg?.userId || "",
    content: msg?.content || "",
    fileUrl: Array.isArray(msg?.fileUrl)
      ? msg.fileUrl.filter(Boolean)
      : msg?.fileUrl
        ? [msg.fileUrl]
        : [],
    timestamp: formatTimestamp(msg?.createdAt),
    partner: msg?.sender
      ? {
          fullName: msg.sender.fullName,
          profileImage: msg.sender.profileImage,
        }
      : msg?.partner,
  });

  const mergeIncomingMessages = (
    prev: ChatMessage[],
    incoming: ChatMessage[],
  ) => {
    const seen = new Set(prev.map((message) => message.id));
    return [...prev, ...incoming.filter((message) => !seen.has(message.id))];
  };

  const seedConversationMessages = (conv: MemberConversation) => {
    if (!conv.lastMessage?.content) {
      return [] as ChatMessage[];
    }

    const inferredSenderId =
      conv.partner?.id ||
      conv.members?.find((member) => member.id !== currentUserId)?.id ||
      "";

    return [
      normalizeMessage(
        {
          id: conv.roomId,
          content: conv.lastMessage.content,
          createdAt: conv.lastMessage.createdAt,
          senderId: inferredSenderId,
          sender: conv.partner
            ? {
                id: conv.partner.id,
                fullName: conv.partner.fullName,
                profileImage: conv.partner.profileImage,
              }
            : undefined,
        },
        0,
      ),
    ];
  };

  const handleAttachmentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";

    if (!files.length) return;

    setIsUploadingAttachments(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("urls", file);
      });

      const response = await generateUrlFn(formData).unwrap();

      if (response?.success && Array.isArray(response?.result)) {
        const uploadedUrls = response.result
          .map((item: any) => item?.url)
          .filter(Boolean);
        const uploadedNames = response.result
          .map((item: any) => item?.originalName)
          .filter(Boolean);

        if (!uploadedUrls.length) {
          toast.error("Attachment upload failed");
          return;
        }

        setAttachmentUrls((prev) => [...prev, ...uploadedUrls]);
        setAttachmentNames((prev) => [...prev, ...uploadedNames]);
        // toast.success("Attachment uploaded successfully");
        return;
      }

      toast.error(response?.message || "Attachment upload failed");
    } catch (error) {
      console.error("Attachment upload error", error);
      toast.error("Attachment upload failed");
    } finally {
      setIsUploadingAttachments(false);
    }
  };

  useEffect(() => {
    const getTokenFromCookies = () => {
      const cookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="));
      return cookie?.split("=")[1];
    };

    const connectWebSocket = () => {
      const token = getTokenFromCookies();
      if (!token) {
        toast.error("Authentication required");
        return null;
      }

      const socket = new WebSocket(
        `ws://206.162.244.144:6015?x-token=${token}`,
      );
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        socket.send(JSON.stringify({ type: "conversation" }));

        // Resubscribe to current room if we have one
        if (selectedRoomId) {
          socket.send(
            JSON.stringify({
              type: "subscribe",
              roomId: selectedRoomId,
            }),
          );
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          switch (data.type) {
            case "conversation":
              setMemberConversations(data.conversations || []);
              break;

            case "subscribe":
              setChatMessages(
                mergeIncomingMessages(
                  [],
                  data.messages
                    ?.slice()
                    .reverse()
                    .map((msg: any, index: number) =>
                      normalizeMessage(msg, index),
                    ) || [],
                ),
              );
              setIsChatLoading(false);
              break;

            case "new-message":
            case "receive-message": {
              const msg = data.message;
              setChatMessages((prev) =>
                mergeIncomingMessages(prev, [
                  normalizeMessage(msg, prev.length),
                ]),
              );
              break;
            }

            case "past-messages":
              setChatMessages(
                mergeIncomingMessages(
                  [],
                  data.messages
                    ?.reverse()
                    .map((msg: any, index: number) =>
                      normalizeMessage(msg, index),
                    ) || [],
                ),
              );
              setIsChatLoading(false);
              break;

            case "error":
              console.error("WebSocket error:", data.message);
              if (data.message.includes("not subscribed") && selectedRoomId) {
                // Resubscribe if we get a not subscribed error
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(
                    JSON.stringify({
                      type: "subscribe",
                      roomId: selectedRoomId,
                    }),
                  );
                }
              }
              break;

            default:
              console.log("Unknown message type:", data.type);
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message", err);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        toast.error("Connection error");
      };

      return socket;
    };

    let socket = connectWebSocket();
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 5000; // 5 seconds

    const reconnect = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(() => {
          console.log(
            `Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`,
          );
          socket = connectWebSocket();
        }, reconnectDelay);
      }
    };

    const onClose = () => {
      console.log("WebSocket closed");
      setIsConnected(false);
      reconnect();
    };

    if (socket) {
      socket.onclose = onClose;
    }

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSendMessage = () => {
    // Allow sending if either text or files are present
    const hasContent = messageInput.trim() || attachmentUrls.length > 0;

    if (!hasContent) {
      toast.warning("Please enter a message or attach a file");
      return;
    }

    if (!selectedRoomId) {
      toast.warning("Please select a chat");
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Connection lost. Please try again.");
      return;
    }

    if (isUploadingAttachments) {
      toast.warning("Please wait for attachment upload to finish");
      return;
    }

    const messagePayload = {
      type: "send-message",
      content: messageInput.trim(),
      fileUrl: attachmentUrls,
    };

    console.log("Sending message payload:", messagePayload);
    socketRef.current.send(JSON.stringify(messagePayload));

    setMessageInput("");
    setAttachmentUrls([]);
    setAttachmentNames([]);
  };

  const handleSelectChat = (conv: MemberConversation) => {
    setSelectedConversation(conv);
    setSelectedRoom(conv?.roomName || conv?.partner?.fullName || "Unknown");
    setSelectedRoomId(conv?.roomId || null);
    setIsChatLoading(true);
    setChatMessages([]);

    if (isMobile) setIsChatOpen(true);

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "subscribe",
          roomId: conv?.roomId,
        }),
      );
    } else {
      toast.error("Connection not ready. Please try again.");
    }
  };

  const getMessageAvatar = (message: ChatMessage, isOwnMessage: boolean) => {
    if (isOwnMessage && isValidUrl(currentUserImage)) {
      return currentUserImage as string;
    }

    if (!isOwnMessage && isValidUrl(message.partner?.profileImage)) {
      return message.partner?.profileImage as string;
    }

    const conversationAvatar = getConversationAvatar(selectedConversation);
    if (conversationAvatar) {
      return conversationAvatar;
    }

    return null;
  };

  const handleAddMemberGroup = () => {
    if (!selectedConversation) {
      toast.warning("No conversation selected");
      return;
    }

    const isGroup =
      (selectedConversation.roomType || "").toLowerCase() === "group";
    if (!isGroup) {
      toast.warning("Only group chats support member invitations");
      return;
    }

    setInviteMemberIds([]);
    setIsInviteModalOpen(true);
  };

  const handleInviteMembers = async () => {
    if (!selectedRoomId) {
      toast.warning("Please select a group first");
      return;
    }

    if (inviteMemberIds.length === 0) {
      toast.warning("Please select at least one member");
      return;
    }

    try {
      await inviteMemberGroupFn({
        groupId: selectedRoomId,
        memberIds: inviteMemberIds,
      }).unwrap();

      toast.success("Members invited successfully");
      setIsInviteModalOpen(false);
      setInviteMemberIds([]);

      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "conversation" }));
      }
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to invite members");
    }
  };

  const existingMemberIds = new Set(
    selectedConversation?.members?.map((member) => member.id) || [],
  );

  const inviteCandidates = allUsers.filter((user: any) => {
    if (!user?.id) return false;
    if (user.id === currentUserId) return false;
    return !existingMemberIds.has(user.id);
  });

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-0 gap-6 overflow-hidden text-[rgb(28,26,60)]">
      {!isMobile || !isChatOpen ? (
        <ChatSidebar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setSelectedChat={handleSelectChat}
          memberConversations={memberConversations}
          selectedRoomId={selectedRoomId}
          currentUserId={currentUserId}
          isConnected={isConnected}
        />
      ) : null}

      {(!isMobile || isChatOpen) && (
        <div
          className={`flex h-full min-h-0 flex-1 flex-col rounded-2xl border border-[#EEF1F7] bg-[#F8F9FC] overflow-hidden ${
            isMobile && isChatOpen
              ? "fixed inset-0 z-50 bg-white md:static md:z-auto"
              : ""
          }`}
        >
          <div className="p-4 md:p-5 flex items-center justify-between border-b border-[#E9EDF6] bg-white">
            <div className="flex items-center gap-3 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-[#7A8099] hover:bg-[#F3F5FB]"
                onClick={() => {
                  if (isMobile && isChatOpen) {
                    setIsChatOpen(false);
                  }
                }}
              >
                <BsArrowLeft className="h-5 w-5" />
              </Button>

              <div className="relative h-11 w-11 rounded-full overflow-hidden bg-[#E7EBF5]">
                <Image
                  src={
                    getConversationAvatar(selectedConversation) ||
                    defaultProfileImage
                  }
                  alt="room"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="relative">
                <h2 className="font-semibold text-lg leading-tight text-[#262B45]">
                  {getConversationTitle(selectedConversation)}
                </h2>

                {/* Members hover popover */}
                {(selectedConversation?.roomType || "").toLowerCase() ===
                "group" ? (
                  <div className="group relative inline-block">
                    <p className="text-xs text-[#8D93AC] mt-0.5 cursor-pointer select-none">
                      {getConversationMeta(selectedConversation)}
                      {!isConnected ? " • Disconnected" : ""}
                    </p>

                    {/* Popover card */}
                    <div
                      className="absolute left-0 top-full mt-2 z-50 w-64
                                 rounded-2xl border border-[#E9EDF6] bg-white shadow-xl
                                 opacity-0 pointer-events-none translate-y-1
                                 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0
                                 transition-all duration-200"
                    >
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-[#F3F5FB]">
                        <p className="text-xs font-semibold text-[#7A8099] uppercase tracking-wide">
                          Group Members (
                          {selectedConversation?.members?.length || 0})
                        </p>
                      </div>

                      {/* Member list */}
                      <ul className="max-h-64 overflow-y-auto py-2">
                        {selectedConversation?.members?.map((member) => (
                          <li
                            key={member.id}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-[#F9FAFB] transition-colors"
                          >
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="h-8 w-8 rounded-full overflow-hidden bg-[#E7EBF5]">
                                <Image
                                  src={
                                    isValidUrl(member.profileImage)
                                      ? (member.profileImage as string)
                                      : defaultProfileImage
                                  }
                                  alt={member.fullName}
                                  width={32}
                                  height={32}
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              {/* Online dot */}
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${
                                  member.isActive
                                    ? "bg-green-400"
                                    : "bg-gray-300"
                                }`}
                              />
                            </div>

                            {/* Name + status */}
                            <div className="flex-1 min-w-0">
                              <p className="text-base md:text-lg font-medium text-[#262B45] truncate">
                                {member.fullName}
                                {member.id === currentUserId && (
                                  <span className="ml-1 text-base md:text-lg text-[#F28B3B] font-semibold">
                                    (You)
                                  </span>
                                )}
                              </p>
                              <p
                                className={`text-[10px] ${member.isActive ? "text-green-500" : "text-[#9AA1B9]"}`}
                              >
                                {member.isActive ? "Online" : "Offline"}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#8D93AC] mt-0.5">
                    {getConversationMeta(selectedConversation)}
                    {!isConnected ? " • Disconnected" : ""}
                  </p>
                )}
              </div>
            </div>

            {/* ── 3-dot menu ── */}
            {(selectedConversation?.roomType || "").toLowerCase() ===
              "group" && (
              <div className="relative" ref={menuRef}>
                <Button
                  variant="ghost"
                  size="icon"
                  className=" rounded-xl text-[#F28B3B] hover:bg-[#FFF4EA]"
                  onClick={() => setIsMenuOpen((v) => !v)}
                >
                  <MoreVertical size={30} />
                </Button>

                {isMenuOpen && (
                  <>
                    {/* backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsMenuOpen(false)}
                    />
                    {/* dropdown */}
                    <div className="absolute right-0 top-full mt-1 z-50 w-72 rounded-2xl border border-[#E9EDF6] bg-white shadow-xl py-1 overflow-hidden">
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-base md:text-lg text-[#262B45] hover:bg-[#FFF4EA] transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleAddMemberGroup();
                        }}
                      >
                        <UserPlus size={20} className="text-[#F28B3B]" />
                        Add Member
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-4 py-3 text-base md:text-lg text-[#262B45] hover:bg-[#FFF4EA] transition-colors"
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMemberSearch("");
                          setIsMembersOpen(true);
                        }}
                      >
                        <Users size={20} className="text-[#F28B3B]" />
                        See All Members
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0 space-y-5 overflow-y-auto px-3 py-4 md:px-6 md:py-6">
            {isChatLoading ? (
              <div className="flex flex-col h-full min-h-[400px] px-1 py-2 space-y-5">
                {/* Shimmer keyframe injected inline */}
                <style>{`
                  @keyframes msgShimmer {
                    0%   { background-position: -400px 0; }
                    100% { background-position:  400px 0; }
                  }
                  .msg-shimmer {
                    background: linear-gradient(90deg, #eef1f7 25%, #f8f9fc 50%, #eef1f7 75%);
                    background-size: 800px 100%;
                    animation: msgShimmer 1.6s infinite linear;
                  }
                  .msg-shimmer-orange {
                    background: linear-gradient(90deg, #f5dece 25%, #fdf0e8 50%, #f5dece 75%);
                    background-size: 800px 100%;
                    animation: msgShimmer 1.6s infinite linear;
                  }
                `}</style>

                {/* Date divider */}
                <div className="flex items-center gap-3 px-2">
                  <div className="flex-1 h-px bg-[#EEF1F7]" />
                  <div className="msg-shimmer h-3 w-20 rounded-full" />
                  <div className="flex-1 h-px bg-[#EEF1F7]" />
                </div>

                {/* Row 1 — received (left), short */}
                <div className="flex items-end gap-2.5">
                  <div className="msg-shimmer h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 max-w-[55%]">
                    <div className="msg-shimmer h-3 w-16 rounded-full" />
                    <div
                      className="msg-shimmer rounded-2xl rounded-bl-sm p-4"
                      style={{ minHeight: 52 }}
                    >
                      <div className="msg-shimmer h-3 w-40 rounded-full" />
                      <div className="msg-shimmer h-3 w-28 rounded-full mt-2" />
                    </div>
                    <div className="msg-shimmer h-2.5 w-10 rounded-full opacity-60" />
                  </div>
                </div>

                {/* Row 2 — sent (right), medium */}
                <div className="flex items-end justify-end gap-2.5">
                  <div className="space-y-1.5 max-w-[60%] items-end flex flex-col">
                    <div className="msg-shimmer-orange h-3 w-14 rounded-full ml-auto" />
                    <div
                      className="msg-shimmer-orange rounded-2xl rounded-br-sm p-4 w-full"
                      style={{ minHeight: 52 }}
                    >
                      <div className="msg-shimmer-orange h-3 w-48 rounded-full ml-auto" />
                      <div className="msg-shimmer-orange h-3 w-32 rounded-full mt-2 ml-auto" />
                    </div>
                    <div className="msg-shimmer-orange h-2.5 w-10 rounded-full opacity-60 ml-auto" />
                  </div>
                  <div className="msg-shimmer h-9 w-9 rounded-full shrink-0" />
                </div>

                {/* Row 3 — received (left), long bubble */}
                <div className="flex items-end gap-2.5">
                  <div className="msg-shimmer h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 max-w-[65%]">
                    <div
                      className="msg-shimmer rounded-2xl rounded-bl-sm p-4"
                      style={{ minHeight: 68 }}
                    >
                      <div className="msg-shimmer h-3 w-48 rounded-full" />
                      <div className="msg-shimmer h-3 w-36 rounded-full mt-2" />
                      <div className="msg-shimmer h-3 w-24 rounded-full mt-2" />
                    </div>
                    <div className="msg-shimmer h-2.5 w-10 rounded-full opacity-60" />
                  </div>
                </div>

                {/* Row 4 — sent (right), short */}
                <div className="flex items-end justify-end gap-2.5">
                  <div className="space-y-1.5 max-w-[40%] items-end flex flex-col">
                    <div
                      className="msg-shimmer-orange rounded-2xl rounded-br-sm p-4 w-full"
                      style={{ minHeight: 44 }}
                    >
                      <div className="msg-shimmer-orange h-3 w-28 rounded-full ml-auto" />
                    </div>
                    <div className="msg-shimmer-orange h-2.5 w-10 rounded-full opacity-60 ml-auto" />
                  </div>
                  <div className="msg-shimmer h-9 w-9 rounded-full shrink-0" />
                </div>

                {/* Row 5 — received (left), medium */}
                <div className="flex items-end gap-2.5">
                  <div className="msg-shimmer h-9 w-9 rounded-full shrink-0" />
                  <div className="space-y-1.5 max-w-[58%]">
                    <div
                      className="msg-shimmer rounded-2xl rounded-bl-sm p-4"
                      style={{ minHeight: 52 }}
                    >
                      <div className="msg-shimmer h-3 w-44 rounded-full" />
                      <div className="msg-shimmer h-3 w-20 rounded-full mt-2" />
                    </div>
                    <div className="msg-shimmer h-2.5 w-10 rounded-full opacity-60" />
                  </div>
                </div>

                {/* Loading label */}
                <div className="flex items-center gap-2 text-xs text-[#8D93AC] pt-2 px-1">
                  <div
                    className="h-2 w-2 rounded-full bg-[#F28B3B] animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-[#F28B3B] animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="h-2 w-2 rounded-full bg-[#F28B3B] animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                  <span className="ml-1">Loading conversation…</span>
                </div>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[#9AA1B9] text-sm">
                  {selectedRoomId
                    ? "No messages yet"
                    : "Select a chat to start messaging"}
                </p>
              </div>
            ) : null}

            {chatMessages.map((message) => {
              const isOwnMessage =
                message.senderId === currentUserId ||
                message.userId === currentUserId;
              const messageAvatar = getMessageAvatar(message, isOwnMessage);

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="relative h-9 w-9 rounded-full overflow-hidden bg-[#E7EBF5] shrink-0">
                      <Image
                        src={messageAvatar || defaultProfileImage}
                        alt="sender"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[78%] md:max-w-[66%]">
                    <div
                      className={`px-5 py-3.5 break-words whitespace-pre-wrap rounded-2xl ${
                        isOwnMessage
                          ? "bg-[#E279321A] text-[#2A3554] rounded-br-md"
                          : "bg-[#E279321A] text-[#2A3554] rounded-bl-md"
                      }`}
                    >
                      {message.content ? (
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                      ) : null}

                      {!!message.fileUrl?.length && (
                        <div className="mt-2 flex flex-col gap-2">
                          {message.fileUrl.map((url: string) => {
                            const isImage = isImageFileUrl(url);
                            return isImage ? (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="block"
                              >
                                <div className="relative aspect-[9/16] w-full max-w-[960px] overflow-hidden ">
                                  <Image
                                    src={url}
                                    alt={getFileNameFromUrl(url)}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </a>
                            ) : (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 rounded-lg border border-[#D9DEEA] bg-white px-3 py-2 text-xs text-[#3B5BA9] underline break-all"
                              >
                                {getFileNameFromUrl(url)}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {message.timestamp && (
                      <p
                        className={`text-[10px] text-[#98A0B8] mt-1 ${isOwnMessage ? "text-right" : "text-left"}`}
                      >
                        {message.timestamp}
                      </p>
                    )}
                  </div>

                  {isOwnMessage && (
                    <div className="relative h-9 w-9 rounded-full overflow-hidden bg-[#E7EBF5] shrink-0">
                      <Image
                        src={messageAvatar || defaultProfileImage}
                        alt="me"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 md:p-5 bg-[#F8F9FC]">
            {attachmentNames.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachmentNames.map((name) => (
                  <span
                    key={name}
                    className="rounded-full border border-[#D9DEEA] bg-white px-3 py-1 text-xs text-[#6D748E]"
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}

            <input
              ref={attachmentInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleAttachmentUpload}
            />

            <div className="flex items-center gap-2 border border-[#D9DEEA] bg-white px-2 py-2 rounded-2xl shadow-[0_2px_8px_rgba(21,30,64,0.04)]">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-[#7F86A0] hover:bg-[#F3F5FB]"
                disabled={
                  !selectedRoomId || !isConnected || isUploadingAttachments
                }
                onClick={() => attachmentInputRef.current?.click()}
              >
                <Plus className="h-5 w-5" />
              </Button>

              <div className="flex-1 relative">
                <Input
                  placeholder={
                    selectedRoomId
                      ? "Type Messages"
                      : "Select a chat to message"
                  }
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="border-none h-10 text-base placeholder:text-[#97A0BA]   focus:outline-none
  shadow-none
  focus:ring-2
  focus:ring-primary
  focus:border-primary"
                  disabled={!selectedRoomId || !isConnected}
                />
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={
                  (!messageInput.trim() && attachmentUrls.length === 0) ||
                  !selectedRoomId ||
                  !isConnected ||
                  isUploadingAttachments
                }
                className="bg-[#F28B3B] hover:bg-[#E67D2D] transition-colors h-9 w-9 rounded-xl p-0 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── See All Members Panel ── */}
      {isMembersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-xl rounded-2xl bg-white shadow-xl flex flex-col"
            style={{ maxHeight: "80vh" }}
          >
            {/* header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9EDF6]">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-[#262B45]">
                  Group Members
                </h3>
                <p className="text-base text-[#8D93AC] mt-0.5">
                  {selectedConversation?.members?.length || 0} members
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMembersOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#7A8099] hover:bg-[#F3F5FB] transition-colors"
              >
                <X size={25} />
              </button>
            </div>

            {/* search */}
            <div className="px-4 py-3 border-b border-[#F3F5FB]">
              <div className="flex items-center gap-2 rounded-xl border border-[#E9EDF6] bg-[#F8F9FC] px-3 py-2">
                <Search size={14} className="text-[#9AA1B9] shrink-0" />
                <input
                  type="text"
                  placeholder="Search members…"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="flex-1 bg-transparent text-base md:text-lg text-[#262B45] placeholder:text-[#9AA1B9] outline-none"
                />
                {memberSearch && (
                  <button
                    type="button"
                    onClick={() => setMemberSearch("")}
                    className="text-[#9AA1B9] hover:text-[#262B45]"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* member list */}
            <ul className="flex-1 overflow-y-auto py-2 px-2">
              {(selectedConversation?.members || [])
                .filter((m) =>
                  m.fullName.toLowerCase().includes(memberSearch.toLowerCase()),
                )
                .map((member) => (
                  <li
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[#F8F9FC] transition-colors"
                  >
                    {/* avatar */}
                    <div className="relative shrink-0">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-[#E7EBF5]">
                        <Image
                          src={
                            isValidUrl(member.profileImage)
                              ? (member.profileImage as string)
                              : defaultProfileImage
                          }
                          alt={member.fullName}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                          member.isActive ? "bg-green-400" : "bg-gray-300"
                        }`}
                      />
                    </div>

                    {/* info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base md:text-xl font-medium text-[#262B45] truncate">
                        {member.fullName}
                        {member.id === currentUserId && (
                          <span className="ml-1.5 text-base font-semibold text-[#F28B3B]">
                            (You)
                          </span>
                        )}
                      </p>
                      <p
                        className={`text-base ${member.isActive ? "text-green-500" : "text-[#9AA1B9]"}`}
                      >
                        {member.isActive ? "● Online" : "○ Offline"}
                      </p>
                    </div>
                  </li>
                ))}

              {/* empty state */}
              {(selectedConversation?.members || []).filter((m) =>
                m.fullName.toLowerCase().includes(memberSearch.toLowerCase()),
              ).length === 0 && (
                <li className="py-8 text-center text-base md:text-lg text-[#9AA1B9]">
                  No members found.
                </li>
              )}
            </ul>

            {/* footer */}
            <div className="px-5 py-3 border-t border-[#F3F5FB]">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFF4EA] py-2.5 text-base md:text-lg font-medium text-[#F28B3B] hover:bg-[#FFE8D1] transition-colors"
                onClick={() => {
                  setIsMembersOpen(false);
                  handleAddMemberGroup();
                }}
              >
                <UserPlus size={20} />
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#262B45]">
                  Invite Group Members
                </h3>
                <p className="text-sm text-[#8D93AC]">
                  Select users to invite to this group.
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-[#7A8099]"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Close
              </Button>
            </div>

            <div className="max-h-[360px] space-y-2 overflow-y-auto rounded-xl border border-[#E9EDF6] p-3">
              {inviteCandidates.length === 0 ? (
                <p className="py-6 text-center text-sm text-[#9AA1B9]">
                  No users available to invite.
                </p>
              ) : (
                inviteCandidates.map((user: any) => {
                  const isSelected = inviteMemberIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setInviteMemberIds((prev) =>
                          prev.includes(user.id)
                            ? prev.filter((id) => id !== user.id)
                            : [...prev, user.id],
                        );
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                        isSelected ? "bg-[#F28B3B1A]" : "hover:bg-[#F5F7FC]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 overflow-hidden rounded-full bg-[#E7EBF5]">
                          <Image
                            src={
                              isValidUrl(user?.profileImage)
                                ? user.profileImage
                                : defaultProfileImage
                            }
                            alt={user?.fullName || "user"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#262B45]">
                            {user?.fullName || "Unknown"}
                          </p>
                          <p className="text-xs text-[#8D93AC]">
                            {user?.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          isSelected
                            ? "bg-[#F28B3B] text-white"
                            : "bg-[#EEF1F7] text-[#7A8099]"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm text-[#7A8099]">
                {inviteMemberIds.length} member(s) selected
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setInviteMemberIds([]);
                    setIsInviteModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteMembers}
                  disabled={isInvitingMembers || inviteMemberIds.length === 0}
                  className="bg-[#F28B3B] hover:bg-[#E67D2D] text-white"
                >
                  {isInvitingMembers ? "Inviting..." : "Invite Members"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
