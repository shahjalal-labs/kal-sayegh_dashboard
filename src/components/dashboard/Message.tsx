"use client";

import { Plus, Search, Send, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }
  };

  return (
    <div className="flex h-screen b p-4 gap-6 rounded-2xl">
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chats</h2>
          <Plus
            onClick={() => setOpen(true)}
            className="w-5 h-5 text-gray-500 cursor-pointer"
          />
        </div>

        <p className="text-sm text-gray-400 mb-4">26 Message, 3 Unread</p>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search message"
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div className="space-y-3">
          {chats.map((chat, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg cursor-pointer transition ${
                chat.active ? "bg-[#E279321A]" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{chat.name}</h4>
                <span className="text-xs text-gray-400">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">{chat.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="hidden md:flex flex-col flex-1 bg-white rounded-2xl shadow-sm">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b mb-2">
          <div className="w-10 h-10 rounded-full bg-gray-300" />
          <div>
            <h3 className="font-semibold">Field Team Hub</h3>
            <p className="text-xs text-gray-400">45 members, 24 online</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-secondary">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs md:max-w-md px-4 py-3 rounded-xl text-sm ${
                  msg.sender === "me"
                    ? "bg-[#E279321A] text-gray-800 ml-10"
                    : "bg-gray-200 text-gray-800 mr-10"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t flex items-center gap-3">
          <input
            type="text"
            placeholder="Type Messages"
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
          <button className="bg-primary p-3 rounded-lg text-white">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-xl rounded-2xl p-6 relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-gray-500"
            >
              <X />
            </button>

            <h2 className="text-xl font-normal mb-4">Create New Group</h2>

            <div className="space-y-4">
              <div>
                <label className="text-base font-normal">Group Name</label>
                <select className="w-full mt-1 border rounded-lg px-3 py-2">
                  <option>Select group</option>
                  <option>Team A</option>
                  <option>Team B</option>
                </select>
              </div>
              <div>
                <label className="text-base font-normal">Group Image</label>

                <div className="mt-2 ">
                  <label className="w-full h-32 flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-xl cursor-pointer  transition">
                    {preview ? (
                      <Image
                        src={preview}
                        alt="preview"
                        width={100}
                        height={100}
                        className="h-full w-full object-contain rounded-xl"
                      />
                    ) : (
                      <div className="text-center text-gray-400 text-sm">
                        <p>Click to upload</p>
                        <p className="text-xs">PNG, JPG</p>
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
                  className="px-6 py-2 border rounded-xl border-primary text-primary"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-primary hover:bg-primary/90 transition-all text-white rounded-xl">
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
