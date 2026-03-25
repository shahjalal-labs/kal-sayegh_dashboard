"use client";

import { Search } from "lucide-react";

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
  return (
    <div className="bg-secondary p-6 rounded-lg">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg md:text-2xl font-normal">Estimate List</h2>

        <div className="flex items-center gap-4">
          {/* Search */}
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

          {/* Button */}
          <button className="px-6 py-3 bg-primary text-secondary rounded-xl">
            + New Estimate
          </button>
        </div>
      </div>

      {/* Status Buttons */}
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

      {/* List */}
      <div className="mt-10 space-y-6">
        {/* Month Header */}
        <div className="flex justify-between text-sm text-gray-500 border-b pb-2">
          <span>February 2026</span>
          <span>Total: $14.11</span>
        </div>

        {estimates.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6"
          >
            {/* Left */}
            <div>
              <h3 className="font-semibold text-gray-800">{item.name}</h3>
              <p className="text-sm text-gray-400">{item.date}</p>
            </div>

            {/* Status */}
            <div>
              <span className="px-3 py-1 text-xs rounded-full bg-[#2196F34D] text-[#2196F3]">
                ISSUED
              </span>
            </div>

            {/* Address */}
            <div className="text-sm text-gray-500 max-w-xs">
              <p>{item.address}</p>
              <p>{item.phone}</p>
            </div>

            {/* Amount */}
            <div className="text-right">
              <p className="font-semibold">{item.amount}</p>
              <p className="text-sm text-gray-400">Email Sent</p>
            </div>

            {/* Actions */}
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
    </div>
  );
}
