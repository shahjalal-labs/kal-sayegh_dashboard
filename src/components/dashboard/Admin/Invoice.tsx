import { Search } from "lucide-react";

const invoices = [
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

export default function Invoice() {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-lg md:text-2xl font-normal">Invoice List</h2>

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

          <button className="px-6 py-3 bg-primary text-secondary rounded-xl">
            + New Invoice
          </button>
        </div>
      </div>

      <div className="mt-10 space-y-6 border-t px-4 p-4">
        <div className="flex justify-between text-base border-b pb-2">
          <span>February 2026</span>
          <span>Total: $14.11</span>
        </div>

        {invoices.map((item) => (
          <div
            key={item.id}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6"
          >
            <div>
              <h3 className="font-semibold text-gray-800 border-b border-[#65CD4C33]">
                {item.name}
              </h3>
              <p className="text-base  text-gray-400">{item.date}</p>
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
    </div>
  );
}
