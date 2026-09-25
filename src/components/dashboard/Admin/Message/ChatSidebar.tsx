"use client";

import { Input } from "@/components/ui/input";
import { useCreateGroupMutation } from "@/redux/api/admin/messageApi";
import { useGetAllUsersQuery } from "@/redux/api/admin/userApi";
import { formatDistanceToNowStrict } from "date-fns";

import { Plus, Search, X } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";

import { toast } from "sonner";

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

type Props = {
  searchInput: string;
  setSearchInput: (value: string) => void;
  setSelectedChat: (value: MemberConversation) => void;
  memberConversations: MemberConversation[];
  selectedRoomId: string | null;
  currentUserId?: string;
  isConnected: boolean;
};

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function formatRelativeTime(dateStr?: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return formatDistanceToNowStrict(d, { addSuffix: true });
}

export default function ChatSidebar({
  searchInput,
  setSearchInput,
  setSelectedChat,
  memberConversations,
  selectedRoomId,
  currentUserId,
  isConnected,
}: Props) {
  const filteredConversations = (memberConversations || []).filter((conv) => {
    const searchValue = searchInput.toLowerCase();
    const roomTitle =
      conv.roomName ||
      conv.partner?.fullName ||
      conv.members?.find((member) => member.id !== currentUserId)?.fullName ||
      "";
    return roomTitle.toLowerCase().includes(searchValue);
  });

  const [groupPhoto, setGroupPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [groupName, setGroupName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [showUsers, setShowUsers] = useState(false);

  const [createGroup] = useCreateGroupMutation();
  const { data } = useGetAllUsersQuery({});
  const userInfo: any[] = Array.isArray(data?.result?.data)
    ? data.result.data
    : Array.isArray(data?.result)
    ? data.result
    : [];

  const handleRemoveImage = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setGroupPhoto(null);
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setGroupPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCreateGroup = async () => {
    try {
      const formData = new FormData();

      formData.append("groupName", groupName);

      memberIds.forEach((id) => {
        formData.append("memberIds[]", id);
      });

      if (groupPhoto) {
        formData.append("groupPhoto", groupPhoto);
      }

      await createGroup(formData).unwrap();

      toast.success("Group created successfully");

      setGroupName("");
      setMemberIds([]);
      handleRemoveImage();
      setOpen(false);
    } catch (err) {
      console.log(err);
      toast.error("Failed to create group");
    }
  };

  const getConversationAvatar = (conv: MemberConversation) => {
    const isGroup = (conv.roomType || "").toLowerCase() === "group";

    if (isGroup && conv.roomPhoto && isValidUrl(conv.roomPhoto)) {
      return conv.roomPhoto;
    }

    if (conv.partner?.profileImage && isValidUrl(conv.partner.profileImage)) {
      return conv.partner.profileImage;
    }

    const otherMember = conv.members?.find(
      (member) => member.id !== currentUserId,
    );
    if (otherMember?.profileImage && isValidUrl(otherMember.profileImage)) {
      return otherMember.profileImage;
    }

    return null;
  };

  const getConversationTitle = (conv: MemberConversation) => {
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

  return (
    <div className=" w-full md:w-80 h-full min-h-0 flex flex-col md:gap-4">
      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Chats</h1>
          {!isConnected && (
            <span className="text-xs text-red-500">(Disconnected)</span>
          )}
          <Plus
            onClick={() => setOpen(true)}
            className="w-5 h-5 text-gray-500 cursor-pointer"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#817F9B] " />
          <Input
            placeholder="Search chats"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 border border-[#E1E5F3] outline-none placeholder:text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            disabled={!isConnected}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-white">
        <h2 className="px-4 pt-4 pb-2 text-sm font-semibold text-[#817F9B] uppercase">
          Conversations
        </h2>
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <div
              key={conv.roomId}
              onClick={() => {
                if (!isConnected) {
                  toast.error("Connection lost. Please try again later.");
                  return;
                }
                setSelectedChat(conv);
              }}
              className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors ${
                selectedRoomId === conv.roomId
                  ? "bg-[#F6EFE9]"
                  : "hover:bg-[#00A8CC1A]"
              } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                {getConversationAvatar(conv) && (
                  <Image
                    src={getConversationAvatar(conv) as string}
                    alt="avatar"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">
                  {getConversationTitle(conv)}
                </h3>
                <p className="text-xs text-[#817F9B] truncate">
                  {conv.lastMessage?.content || "No messages"}
                </p>
              </div>
              <span className="text-[10px] text-[#817F9B]">
                {formatRelativeTime(conv.lastMessage?.createdAt)}
              </span>
            </div>
          ))
        ) : (
          <p className="px-4 py-2 text-sm text-[#817F9B]">
            No conversations found
          </p>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 relative">
            <h2 className="text-xl mb-4">Create New Group</h2>

            <div className="space-y-4">
              <div>
                <label>Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Group Image</label>
                <div className="mt-2">
                  {preview ? (
                    <div className="relative w-full h-32 flex items-center justify-center border-2 border-dashed border-primary rounded-xl overflow-hidden bg-gray-50/50">
                      <Image
                        src={preview}
                        alt="preview"
                        width={100}
                        height={100}
                        className="h-full w-full object-contain rounded-xl p-2"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-xl cursor-pointer hover:bg-gray-50/50 transition-colors">
                      <div className="text-gray-400 text-sm text-center">
                        Click to upload
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowUsers((prev) => !prev)}
                className="border-primary border py-2 px-4 rounded-xl"
              >
                +Add Members
              </button>

              {showUsers && (
                <div className="mt-3 border rounded-xl p-3 max-h-60 overflow-y-auto space-y-2 bg-white">
                  {userInfo.length === 0 ? (
                    <p className="text-base text-gray-400">No users found</p>
                  ) : (
                    userInfo.map((user: any) => {
                      const isSelected = memberIds.includes(user.id);

                      return (
                        <div
                          key={user.id}
                          onClick={() => {
                            setMemberIds((prev) =>
                              prev.includes(user.id)
                                ? prev.filter((id) => id !== user.id)
                                : [...prev, user.id],
                            );
                          }}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer ${
                            isSelected
                              ? "bg-primary text-white "
                              : "hover:bg-gray-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Image
                              src={user.profileImage}
                              alt="user"
                              width={30}
                              height={30}
                              className="rounded-full"
                            />

                            <div className="flex flex-col">
                              <span className="text-b font-medium">
                                {user.fullName}
                              </span>
                              <span className="text-base ">{user.email}</span>
                            </div>
                          </div>

                          {isSelected && <span className="text-xs">✓</span>}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setOpen(false);
                    setGroupName("");
                    setMemberIds([]);
                    handleRemoveImage();
                    setShowUsers(false);
                  }}
                  className="px-6 py-2 border rounded-xl border-primary hover:bg-primary transition-colors duration-300 ease-in hover:text-secondary text-primary"
                >
                  Close
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
