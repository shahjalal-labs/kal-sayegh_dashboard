"use client";

import { Edit, Eye, Power } from "lucide-react";
import React from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { ColorRing } from "react-loader-spinner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/Pagination";

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
  onDelete?: (row: any) => void;
  onToggleStatus?: (row: any) => void;

  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const ReusableTable: React.FC<ReusableTableProps> = ({
  columns,
  data = [],
  isLoading = false,
  error,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  page = 1,
  totalPages = 1,
  onPageChange,
}) => {
  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <ColorRing
          visible={true}
          height="70"
          width="70"
          colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
      </div>
    );

  if (error) return <p className="text-center py-4 text-red-500">{error}</p>;
  if (!data || data.length === 0)
    return <p className="text-center py-4">No data available</p>;

  const getStatusBadge = (status: string) => {
    const normalized = status?.toLowerCase?.() || "";
    const base = "px-4 py-2 rounded-lg text-sm font-normal";

    if (normalized === "active")
      return (
        <span className={`${base} bg-[#52C41A1A] text-[#2A7A16]`}>Active</span>
      );

    if (normalized === "inactive")
      return (
        <span className={`${base} bg-[#FFEDED] text-[#C40F0F]`}>Inactive</span>
      );

    if (normalized === "pending")
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>
      );

    return <span className={base}>{status}</span>;
  };

  return (
    <div className="space-y-4">
      {/* TABLE */}
      <div className="overflow-x-auto mb-14">
        <table className="w-full">
          <thead>
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
                  <td key={col.key} className="p-2">
                    {col.key === "action" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => onView?.(row)}
                          className="text-orange-500"
                        >
                          <Eye size={20} />
                        </button>

                        <button
                          onClick={() => onEdit?.(row)}
                          className="text-green-600"
                        >
                          <Edit size={20} />
                        </button>

                        <button
                          onClick={() => onDelete?.(row)}
                          className="text-red-500"
                        >
                          <RiDeleteBin6Line size={20} />
                        </button>

                        {onToggleStatus && (
                          <button
                            onClick={() => onToggleStatus(row)}
                            className={
                              row.status === "active"
                                ? "text-green-600"
                                : "text-gray-400"
                            }
                            title={
                              row.status === "active"
                                ? "Deactivate"
                                : "Activate"
                            }
                          >
                            <Power size={20} />
                          </button>
                        )}
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

      {/* PAGINATION */}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => onPageChange?.(Math.max(page - 1, 1))}
              />
            </PaginationItem>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === page}
                    onClick={() => onPageChange?.(pageNum)}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                onClick={() => onPageChange?.(Math.min(page + 1, totalPages))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default ReusableTable;
