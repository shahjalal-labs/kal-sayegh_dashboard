"use client";

import { Check, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  },
  {
    id: 2,
    name: "Arlene McCoy #2",
    date: "February 28th 2026",
    address: "2715 Ash Dr. San Jose, South Dakota 83475",
    phone: "+123 456 789",
    amount: "$14.11",
  },
  {
    id: 3,
    name: "Jerome Bell #3",
    date: "February 28th 2026",
    address: "1901 Thornridge Cir. Shiloh, Hawaii 81063",
    phone: "+123 456 789",
    amount: "$14.11",
  },
];

export default function Estimate() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const options = [
    { id: "description", label: "Description" },
    { id: "table", label: "Table Format" },
    { id: "upload", label: "Upload File" },
  ];

  return (
    <div className="bg-secondary p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg md:text-2xl font-normal">Estimate List</h2>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-80">
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
            className="px-6 py-3 bg-primary text-secondary rounded-xl"
          >
            + New Estimate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <button className="w-full bg-primary text-secondary py-3 rounded-lg">
          Pending
        </button>
        <button className="w-full border border-primary text-primary py-3 rounded-lg">
          Approved
        </button>
        <button className="w-full border border-primary text-primary py-3 rounded-lg">
          Declined
        </button>
      </div>

      <div className="mt-10 space-y-6">
        <div className="flex justify-between text-sm text-gray-500 border-b pb-2">
          <span>February 2026</span>
          <span>Total: $14.11</span>
        </div>

        {estimates.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6"
          >
            <div>
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.date}</p>
            </div>

            <div>
              <span className="px-3 py-1 text-xs rounded-full bg-[#2196F34D] text-[#2196F3]">
                ISSUED
              </span>
            </div>

            <div className="text-sm text-gray-500 max-w-xs">
              <p>{item.address}</p>
              <p>{item.phone}</p>
            </div>

            <div className="text-right">
              <p className="font-semibold">{item.amount}</p>
              <p className="text-sm text-gray-400">Email Sent</p>
            </div>

            <div className="flex gap-2">
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

      <div>
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
                  router.push("/admin/estimate/estimate-table");
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
                className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-all duration-200 `}
              >
                <input
                  type="text"
                  readOnly
                  value={item.label}
                  className={`w-full bg-transparent outline-none cursor-pointer `}
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
    </div>
  );
}
