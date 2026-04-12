"use client";

import profile from "@/assets/navbar/profile.png";
import { useCreateGroupMutation } from "@/redux/api/admin/messageApi";
import { useGetAllUsersQuery } from "@/redux/api/userApi";
import { Plus, Search, Send } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { TbUserPlus } from "react-icons/tb";
import { toast } from "sonner";

const chats = [
  {
    name: "Dustin",
    message: "But I, that am not shaped for...",
    time: "9:31 am",
  },
  {
    name: "Jorge",
    message: "But I, that am not shaped for...",
    time: "9:40 am",
  },
  {
    name: "Field Team Hub",
    message: "Paolo: Looking forward to meeti...",
    time: "8:35 am",
    active: true,
  },
  {
    name: "Marvin",
    message: "But I, that am not shaped for...",
    time: "9:50 am",
  },
];

const messages = [
  { text: "Good morning team! Today’s schedule: 8 AM...", sender: "other" },
  { text: "Got it, sir. On my way to office now.", sender: "me" },
  {
    text: "Sir, I’m already at Site A. Should I clock in here directly?",
    sender: "other",
  },
  {
    text: "Marvin — please restart the app and enable GPS permissions.",
    sender: "me",
  },
  {
    text: "Weekly timesheet submitted. Checked my hours – looks correct.",
    sender: "other",
  },
  {
    text: "Great job everyone. Final update: Site B delayed till tomorrow.",
    sender: "me",
  },
];

export default function Message() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [activeChat, setActiveChat] = useState<number | null>(null);

  const [groupName, setGroupName] = useState("");
  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [groupPhoto, setGroupPhoto] = useState<File | null>(null);
  const [showUsers, setShowUsers] = useState(false);

  const [createGroup] = useCreateGroupMutation();

  const { data } = useGetAllUsersQuery({});
  const users = data?.result || [];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      setGroupPhoto(null);
      setPreview(null);
      setOpen(false);
    } catch (err) {
      console.log(err);
      toast.error("Failed to create group");
    }
  };

  return (
    <div className="flex h-screen  gap-5">
      <div
        className={`
        ${activeChat !== null ? "hidden" : "flex"}
        md:flex flex-col
        w-full md:w-1/3 lg:w-1/4 
        bg-secondary rounded-2xl p-4 shadow-sm
      `}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Plus
            onClick={() => setOpen(true)}
            className="w-5 h-5 text-gray-500 cursor-pointer"
          />
        </div>

        <p className="text-sm text-gray-400 mb-4">{chats.length} Messages</p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search message"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="space-y-3 overflow-y-auto">
          {chats.map((chat, i) => (
            <div
              key={i}
              onClick={() => setActiveChat(i)}
              className={`p-3 rounded-lg cursor-pointer transition ${
                activeChat === i ? "bg-[#E279321A]" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <Image src={profile} alt="profile" width={40} height={40} />

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{chat.name}</h4>
                    <span className="text-xs text-gray-400">{chat.time}</span>
                  </div>

                  <p className="text-sm text-gray-500 truncate">
                    {chat.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`
        ${activeChat === null ? "hidden" : "flex"}
        md:flex flex-col flex-1 
        bg-secondary rounded-2xl shadow-sm 
      `}
      >
        <div className="flex justify-between  gap-3 p-4 border-b rounded-t-2xl">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveChat(null)}
              className="md:hidden text-gray-500 text-lg"
            >
              ←
            </button>

            <Image
              src={""}
              height={40}
              width={40}
              alt="profile"
              className=" rounded-full bg-gray-300"
            />

            <div>
              <h3 className="font-semibold">
                {activeChat !== null && chats[activeChat].name}
              </h3>
              <p className="text-xs text-gray-400">Active now</p>
            </div>
          </div>

          <TbUserPlus size={20} className="cursor-pointer text-primary" />
        </div>

        <div className="flex-1 p-3 md:p-6 space-y-4 overflow-y-auto bg-secondary ">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] md:max-w-md px-4 py-2 rounded-xl text-sm ${
                  msg.sender === "me"
                    ? "bg-[#E279321A] text-gray-800"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 md:p-4 bg-white rounded-2xl">
          <div className="relative w-full ">
            <CiCirclePlus
              size={25}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl"
            />

            <input
              type="text"
              placeholder="Type Messages"
              className="w-full border rounded-xl pl-10 pr-12 py-6 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />

            <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary p-2 mr-2 rounded-lg text-white">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
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
                <label>Group Image</label>
                <div className="mt-2">
                  <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-xl cursor-pointer">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="preview"
                        width={100}
                        height={100}
                        className="h-full w-full object-contain rounded-xl"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm text-center">
                        Click to upload
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
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
                  {users.length === 0 ? (
                    <p className="text-base text-gray-400">No users found</p>
                  ) : (
                    users.map((user: any) => {
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
                              src={user.image || profile}
                              alt="user"
                              width={30}
                              height={30}
                              className="rounded-full"
                            />

                            <div className="flex flex-col">
                              <span className="text-b font-medium">
                                {user.name}
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
                  onClick={() => setOpen(false)}
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
