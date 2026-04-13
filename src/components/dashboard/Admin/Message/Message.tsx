"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BsArrowLeft } from "react-icons/bs";
import { toast } from "sonner";

import { useGetAllUsersQuery } from "@/redux/api/userApi";
import ChatSidebar from "./ChatSidebar";

type ChatMessage = {
  id: number;
  userId: string;
  content: string;
  timestamp?: string;
  partner?: {
    fullName: string;
    profileImage?: string;
  };
};

type MemberConversation = {
  roomId: string;
  partner?: {
    id: string;
    fullName: string;
    profileImage?: string;
    isActive?: boolean;
  };
  lastMessage?: {
    content?: string;
    createdAt?: string;
  };
  unreadCount: number;
};

type UserType = {
  id: string;
  fullName: string;
  profileImage?: string | null;
};

export default function Message() {
  const [selectedRoom, setSelectedRoom] = useState("Select a chat");
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [memberConversations, setMemberConversations] = useState<
    MemberConversation[]
  >([]);
  const [messageInput, setMessageInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const { data, isLoading: isUsersLoading } = useGetAllUsersQuery({});

  const usersData = data?.result;

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
    }
  }, [usersData]);

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
        socket.send(JSON.stringify({ type: "member-conversation" }));

        // Resubscribe to current room if we have one
        if (receiverId) {
          socket.send(
            JSON.stringify({
              type: "member-subscribe",
              receiverId: receiverId,
            }),
          );
        }
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);

          switch (data.type) {
            case "member-conversation":
              setMemberConversations(data.conversations || []);
              break;

            case "member-new-message": {
              const msg = data.message;
              const newMessage: ChatMessage = {
                id: chatMessages.length,
                userId: msg.userId,
                content: msg.content,
                timestamp: msg.createdAt,
                partner: msg.partner,
              };
              setChatMessages((prev) => [...prev, newMessage]);
              break;
            }

            case "past-messages":
              setChatMessages(
                data.messages?.reverse().map((msg: any, index: number) => ({
                  id: index,
                  userId: msg?.userId,
                  content: msg?.content,
                  timestamp: msg?.createdAt,
                  partner: msg?.partner,
                })) || [],
              );
              break;

            case "error":
              console.error("WebSocket error:", data.message);
              if (data.message.includes("not subscribed") && receiverId) {
                // Resubscribe if we get a not subscribed error
                if (socket.readyState === WebSocket.OPEN) {
                  socket.send(
                    JSON.stringify({
                      type: "member-subscribe",
                      receiverId: receiverId,
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
        socket.onclose = null; // Remove the handler to prevent reconnect on intentional close
        socket.close();
      }
    };
  }, [chatMessages.length, receiverId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!messageInput.trim()) {
      toast.warning("Please enter a message");
      return;
    }

    if (!receiverId) {
      toast.warning("Please select a chat");
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
      toast.error("Connection lost. Please try again.");
      return;
    }

    const messagePayload = {
      type: "member-send-message",
      receiverId,
      content: messageInput.trim(),
      fileUrl: [],
    };

    socketRef.current.send(JSON.stringify(messagePayload));
    setMessageInput("");
  };

  const handleSelectChat = (conv: MemberConversation) => {
    setSelectedRoom(conv?.partner?.fullName || "Unknown");
    setReceiverId(conv?.partner?.id || null);
    setChatMessages([]);

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: "member-subscribe",
          receiverId: conv?.partner?.id,
        }),
      );

      // Request past messages
      socketRef.current.send(
        JSON.stringify({
          type: "member-get-messages",
          receiverId: conv?.partner?.id,
        }),
      );
    } else {
      toast.error("Connection not ready. Please try again.");
    }
  };

  if (isUsersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen gap-6 text-[rgb(28,26,60)]">
      <ChatSidebar
        socket={socketRef.current}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setSelectedChat={handleSelectChat}
        memberConversations={memberConversations}
        users={users}
        isConnected={isConnected}
      />

      <div className="flex-1 flex flex-col bg-white h-full rounded-xl overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <BsArrowLeft className="h-6 w-6" />
            </Button>
            <h2 className="font-medium text-lg">{selectedRoom}</h2>
            {!isConnected && (
              <span className="text-xs text-red-500">(Disconnected)</span>
            )}
          </div>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {chatMessages.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                {receiverId
                  ? "No messages yet"
                  : "Select a chat to start messaging"}
              </p>
            </div>
          )}
          {chatMessages.map((message) => {
            const isReceiver = message.userId !== receiverId;
            return (
              <div
                key={message.id}
                className={`flex ${
                  isReceiver ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-6 py-3 break-words whitespace-pre-wrap rounded-xl ${
                    isReceiver
                      ? "bg-[#00A8CC1A] rounded-t-xl rounded-bl-xl"
                      : "bg-blue-300 rounded-t-xl rounded-br-xl"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.timestamp && (
                    <p className="text-[10px] text-[#9197B2] mt-1">
                      {message.timestamp}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 border border-[#E1E5F3] px-5 py-3 rounded-2xl">
            <div className="flex-1 relative">
              <Input
                placeholder={
                  receiverId ? "Type a message" : "Select a chat to message"
                }
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="border-none outline-none shadow-none"
                disabled={!receiverId || !isConnected}
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || !receiverId || !isConnected}
              className="bg-primary hover:bg-primary/80 transition-colors h-10 w-10 rounded-xl p-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
