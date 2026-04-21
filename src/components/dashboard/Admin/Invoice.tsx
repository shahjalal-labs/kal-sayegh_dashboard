"use client";

import { CustomModal } from "@/components/modal/CustomModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";
import { useGetAllInvoiceQuery } from "@/redux/api/admin/invoiceApi";
import { Check, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineMailOpen } from "react-icons/hi";
import { toast } from "sonner";

export default function Invoice() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { data } = useGetAllInvoiceQuery({});
  const invoices = data?.result?.data || [];

  const filteredInvoices = invoices.filter((item: any) => {
    const itemStatus = item.status?.toLowerCase() || "";
    const matchesStatus = itemStatus === activeTab;
    if (!matchesStatus) return false;
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return true;

    const itemText = [
      item.invoiceName,
      item.estimateName,
      item.status,
      item.date,
      item.createdAt,
      item.client?.clientName,
      item.client?.email,
      item.client?.address,
      item.client?.city,
      item.client?.state,
      item.client?.zip,
      item.id,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return itemText.includes(normalizedSearch);
  });

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = filteredInvoices.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const options = [
    { id: "description", label: "Description" },
    { id: "table", label: "Table Format" },
    // { id: "upload", label: "Upload Picture ,PDF , Document" },
  ];

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchTerm]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const parseDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getMonthKey = (item: any) => {
    const dateString = item.createdAt || item.date;
    const date = parseDate(dateString);
    return date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      : "Unknown";
  };

  const grouped = paginatedInvoices.reduce((acc: any, item: any) => {
    const dateString = item.createdAt || item.date;
    const key = getMonthKey(item);
    const label = dateString ? formatMonthYear(dateString) : "Unknown";

    if (!acc[key]) acc[key] = { label, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  const groupedEntries = Object.entries(grouped).sort(([a], [b]) =>
    b.localeCompare(a),
  );

  return (
    <div className="md:bg-secondary bg-secondary-none p-4 md:p-6 rounded-2xl">
      {/* HEADER */}
      <div className=" md:p-2 rounded-lg mb-6">
        <div className="flex items-center justify-between md:flex-row md:items-center md:justify-between gap-4 ">
          {/* LEFT SIDE */}
          <h2 className="text-lg md:text-2xl font-normal">
            <span className="block md:hidden">Invoices</span>
            <span className="hidden md:block">Invoice List</span>
          </h2>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 md:gap-4 ">
            <div className="relative w-full md:w-80 hidden md:block">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search invoice"
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
              <span className="hidden md:inline">New Invoice</span>
            </button>
          </div>
        </div>
        <div className="relative w-full md:w-80 block md:hidden rounded-lg mt-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search invoice"
            className="w-full pl-10 pr-4 h-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>

        {/* TABS */}
        <div className="flex gap-4 md:gap-6 mt-8 bg-[#D8DBDF] p-2 rounded-2xl">
          {["active", "paid"].map((status) => (
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
      </div>

      <div className="md:mt-10 md:space-y-6 ">
        {groupedEntries.length === 0 ? (
          <p className="text-center text-gray-400">
            No {activeTab} invoices found
          </p>
        ) : (
          groupedEntries.map(([_, group]: any) => {
            const month = group.label;
            const items = group.items;
            return (
              <div key={month}>
                <div className="flex justify-between border-b pb-2 mb-4">
                  <span className="font-semibold">{month}</span>
                  <span className="text-gray-500 hidden md:block">
                    Total Outstanding: $
                    {items
                      .reduce(
                        (sum: number, i: any) => sum + (i.grandTotal || 0),
                        0,
                      )
                      .toFixed(2)}
                  </span>
                </div>

                {items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b md:border-0 mb-4"
                  >
                    <div className="flex-1 md:flex-none md:w-[30%]">
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="font-semibold text-gray-800 lg:border-b lg:border-[#52C41A]">
                          {item.invoiceName || "Untitled Invoice"}
                        </span>
                        <span className="block md:hidden font-medium text-gray-600">
                          ${item.grandTotal?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-4 mt-1 text-gray-800 p-2 w-full">
                        <p className="text-sm text-gray-400">
                          {item.createdAt
                            ? formatDate(item.createdAt)
                            : item.date || "-"}
                        </p>
                        <span
                          className={`px-3 py-1 text-xs rounded-full md:hidden block ${
                            item.status?.toLowerCase() === "active"
                              ? "bg-[#FF0000]  text-white"
                              : item.status?.toLowerCase() === "paid"
                                ? "bg-green-100 text-green-600"
                                : "bg-[#FF0000] "
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {item.status?.toLowerCase() === "active"
                              ? "Overdue"
                              : item.status?.toLowerCase() === "paid"
                                ? "Paid"
                                : item.status || "UNKNOWN"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="md:block hidden">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
                          item.status?.toLowerCase() === "active"
                            ? "bg-[#FF0000] text-white "
                            : item.status?.toLowerCase() === "paid"
                              ? "bg-green-100 text-green-600"
                              : "bg-[#FF0000] "
                        }`}
                      >
                        <span className="text-sm font-medium">
                          {item.status?.toLowerCase() === "paid"
                            ? "Paid"
                            : item.status?.toLowerCase() === "active"
                              ? "Overdue"
                              : item.status || "UNKNOWN"}
                        </span>
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 max-w-xs hidden md:block md:w-[20%]">
                      <p>{item?.client?.address}</p>
                      <p>{item?.client?.city}</p>
                      <p>{item?.client?.state}</p>
                      <p>{item?.client?.zip}</p>
                    </div>

                    <div className="text-left hidden md:block md:w-[15%]">
                      <p className="font-semibold">
                        ${item.grandTotal?.toFixed(2) || "0.00"}
                      </p>
                      <p className="text-base flex items-center gap-2">
                        <HiOutlineMailOpen /> Email Sent
                      </p>
                    </div>

                    <div className="hidden md:flex md:gap-2 md:w-[15%] md:justify-end">
                      <button className="px-4 py-2 border border-primary text-primary rounded-lg whitespace-nowrap">
                        Open
                      </button>
                      <button className="px-4 py-2 bg-primary text-secondary rounded-lg whitespace-nowrap">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-b-2xl bg-white p-3 md:flex-row md:px-4 md:py-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (page > 1) setPage(page - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === page}
                      onClick={(event) => {
                        event.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (page < totalPages) setPage(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
                localStorage.setItem("invoiceDetailsFormat", "description");
                router.push("/admin/add-invoice");
              } else if (selected === "table") {
                localStorage.setItem("invoiceDetailsFormat", "table");
                router.push("/admin/add-invoice");
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
