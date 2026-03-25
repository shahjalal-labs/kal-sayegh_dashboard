"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import ReusableTable from "./ReusableTable";

interface Estimator {
  id: number;
  name: string;
  email: string;
  profession: string;
  status: "Active" | "Inactive" | "Pending";
}

const estimatorData: Estimator[] = [
  {
    id: 1,
    name: "Rahim Ahmed",
    email: "rahim@gmail.com",
    profession: "Civil Engineer",
    status: "Active",
  },
  {
    id: 2,
    name: "Karim Hasan",
    email: "karim@gmail.com",
    profession: "Architect",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Nusrat Jahan",
    email: "nusrat@gmail.com",
    profession: "Interior Designer",
    status: "Pending",
  },
];

export default function EstimatorManagement() {
  const [data, setData] = useState<Estimator[]>([]);
  const [loading, setLoading] = useState(true);

  const columns = [
    { key: "name", label: "Estimator Name" },
    { key: "email", label: "Email Address" },
    { key: "profession", label: "Profession" },
    { key: "status", label: "Status" },
    { key: "action", label: "Action" },
  ];

  useEffect(() => {
    // simulate API call
    setTimeout(() => {
      setData(estimatorData);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="mt-6 space-y-7 bg-secondary p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div className="flex flex-wrap gap-4">
          <h2 className="text-lg md:text-2xl font-normal ">
            Estimator Management
          </h2>
        </div>

        <div className="relative w-full md:w-80">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>

          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      <div className="border-t">
        <ReusableTable columns={columns} data={data} isLoading={loading} />
      </div>
    </div>
  );
}
