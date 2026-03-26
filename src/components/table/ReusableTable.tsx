"use client";

import { Edit, Eye } from "lucide-react";
import React from "react";
import { FaSpinner } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";

interface Column {
  key: string;
  label: string;
}

interface ReusableTableProps {
  columns: Column[];
  data?: any[];
  isLoading?: boolean;
  error?: string | null;
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
}

const ReusableTable: React.FC<ReusableTableProps> = ({
  columns,
  data = [],
  isLoading = false,
  error,
  onView,
  onEdit,
}) => {
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-orange-500 text-4xl" />
      </div>
    );

  if (error) return <p className="text-center py-4 text-red-500">{error}</p>;
  if (!data || data.length === 0)
    return <p className="text-center py-4">No data available</p>;

  const getStatusBadge = (status: string) => {
    const base = "px-4 py-2 rounded-lg text-white text-sm font-normal";
    if (status === "Active")
      return (
        <span className={`${base} bg-[#52C41A1A] text-[#41c002]`}>
          {status}
        </span>
      );
    if (status === "Inactive")
      return (
        <span className={`${base} bg-red-200 text-red-900`}>{status}</span>
      );
    if (status === "Pending")
      return (
        <span className={`${base}  bg-[#FAAD141A] text-[#e79d09]`}>
          {status}
        </span>
      );
    return <span className={`${base} bg-gray-500`}>{status}</span>;
  };

  return (
    <div className="overflow-x-auto ">
      <table className="w-full ">
        <thead className="">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="p-2 text-left border-b">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="p-2 ">
                  {col.key === "action" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onView?.(row)}
                        className="text-primary"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => onEdit?.(row)}
                        className="text-[#11AD32]"
                      >
                        <Edit size={20} />
                      </button>
                      <button className="text-red-500">
                        <RiDeleteBin6Line size={20} />
                      </button>
                    </div>
                  ) : col.key === "status" ? (
                    getStatusBadge(row[col.key])
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReusableTable;
