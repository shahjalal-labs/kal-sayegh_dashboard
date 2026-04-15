"use client";

import { Check, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiOutlineMailOpen } from "react-icons/hi";
import { toast } from "sonner";
import { CustomModal } from "../../modal/CustomModal";

const estimates = [
  {
    id: 1,
    name: "John Martinez #1",
    date: "February 28th 2026",
    address: "6391 Elgin St. Celina, Delaware 10299",
    phone: "+123 456 789",
    amount: "$14.11",
    status: "pending",
  },
  {
    id: 2,
    name: "Arlene McCoy #2",
    date: "February 28th 2026",
    address: "2715 Ash Dr. San Jose, South Dakota 83475",
    phone: "+123 456 789",
    amount: "$14.11",
    status: "approved",
  },
  {
    id: 3,
    name: "Jerome Bell #3",
    date: "February 28th 2026",
    address: "1901 Thornridge Cir. Shiloh, Hawaii 81063",
    phone: "+123 456 789",
    amount: "$14.11",
    status: "declined",
  },
];

export default function Estimate() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const options = [
    { id: "description", label: "Description" },
    { id: "table", label: "Table Format" },
    { id: "upload", label: "Upload Picture ,PDF , Document" },
  ];

  const filteredEstimates = estimates.filter(
    (item) => item.status === activeTab,
  );

  return (
    <div className="md:bg-secondary bg-secondary-none p-0 md:p-6 rounded-2xl">
      {/* HEADER */}
      <div className=" md:p-2 rounded-lg mb-6">
        <div className="flex items-center justify-between md:flex-row md:items-center md:justify-between gap-4 ">
          {/* LEFT SIDE */}
          <h2 className="text-lg md:text-2xl font-normal">
            <span className="block md:hidden">Estimate</span>
            <span className="hidden md:block">Estimate List</span>
          </h2>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 md:gap-4 ">
            <div className="relative w-full md:w-80 hidden md:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Search"
                className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="p-3 md:px-6 md:py-3 rounded-xl flex items-center justify-center gap-2 
             text-primary md:text-secondary 
             bg-transparent md:bg-primary"
            >
              <Plus size={20} />
              <span className="hidden md:inline">New Estimate</span>
            </button>
          </div>
        </div>
        <div className="relative w-full md:w-80 block md:hidden rounded-lg mt-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* TABS */}
        <div className="flex gap-4 md:gap-6 mt-8 bg-[#D8DBDF] p-2 rounded-2xl">
          {["pending", "approved", "declined"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`w-full py-3 rounded-lg capitalize ${
                activeTab === status ? "bg-white text-primary" : " "
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <span className="mt-4 md:hidden block text-lg">February </span>
      </div>

      {/* LIST */}
      <div className="md:mt-10 md:space-y-6 ">
        <div className="flex justify-between font-semibold text-lg border-0 md:border-b pb-2 ">
          <span className=" hidden md:block">February 2026</span>
          <span className="hidden md:block">Total: $14.11</span>
        </div>

        {filteredEstimates.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4  pb-6"
          >
            <div className="">
              <div className="flex items-center  justify-between gap-2">
                <span className="font-semibold text-gray-800 lg:border-b lg:border-[#52C41A]">
                  {item.name}
                </span>
                <span className="block md:hidden font-medium text-gray-600">
                  Total: {item.amount}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 mt-1 text-gray-800 border-b md:border-0  space-y-4 p-2">
                <p className="text-sm text-gray-400">{item.date}</p>

                <span
                  className={`px-3 py-1 text-xs rounded-full md:hidden block  ${
                    item.status === "pending"
                      ? "bg-yellow-100 text-yellow-600"
                      : item.status === "approved"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="md:block hidden ">
              <span
                className={`px-3 py-1 text-xs rounded-full ${
                  item.status === "pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : item.status === "approved"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {item.status.toUpperCase()}
              </span>
            </div>

            <div className="text-sm text-gray-500 max-w-xs hidden md:block">
              <p>{item.address}</p>
              <p>{item.phone}</p>
            </div>

            <div className="text-left hidden md:block">
              <p className="font-semibold">{item.amount}</p>
              <p className="text-base flex items-center gap-2">
                <HiOutlineMailOpen /> Email Sent
              </p>
            </div>

            <div className="hidden md:flex md:gap-2">
              <button className="px-4 py-2 border border-primary text-primary rounded-lg">
                Open
              </button>
              <button className="px-4 py-2 bg-primary text-secondary rounded-lg">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <CustomModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Line item"
        actions={[
          {
            label: "Close",
            variant: "secondary",
            onClick: () => setIsOpen(false),
          },
          {
            label: "Add Line",
            variant: "primary",
            onClick: () => {
              if (selected === "description") {
                router.push("/admin/estimate/estimate-description");
              } else if (selected === "table") {
                router.push("/admin/estimate/estimate-description");
              } else if (selected === "upload") {
                router.push("/admin/estimate/upload");
              } else {
                toast.error("Please select an option first!");
              }
            },
          },
        ]}
      >
        <div className="space-y-3">
          {options.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelected(item.id)}
              className="flex items-center justify-between border rounded-lg p-3 cursor-pointer"
            >
              <input
                type="text"
                readOnly
                value={item.label}
                className="w-full bg-transparent outline-none cursor-pointer"
              />

              <div className="w-5 h-5 flex items-center justify-end">
                {selected === item.id && (
                  <Check
                    className="text-white bg-primary rounded-full p-1"
                    size={20}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </CustomModal>
    </div>
  );
}
