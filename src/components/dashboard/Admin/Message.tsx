"use client";

import profile from "@/assets/navbar/profile.png";
import { Plus, Search, Send } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { TbUserPlus } from "react-icons/tb";

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
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
                <input className="w-full mt-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary" />
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

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setOpen(false)}
                  className="px-6 py-2 border rounded-xl border-primary hover:bg-primary transition-colors duration-300 ease-in hover:text-secondary text-primary"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-primary hover:bg-primary/90 transition text-white rounded-xl">
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
