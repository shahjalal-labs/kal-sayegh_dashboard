"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";
import {
  useGetAllEstimatesQuery,
  useSendEstimateMailMutation,
} from "@/redux/api/admin/estimateApi";
import { Check, FilePenLine, MailCheck, MailOpen, Plus, Search } from "lucide-react";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomModal } from "../../../modal/CustomModal";
import { ColorRing } from "react-loader-spinner";

export default function Estimate() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const { data, isLoading, refetch } = useGetAllEstimatesQuery({});
  const estimates = data?.result?.data || [];

  const [sendEmail, { isLoading: isSendingEmail }] =
    useSendEstimateMailMutation();

  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "Your Estimate  from Geo Paving and Sealcoating",
    message: "We are pleased to work with you. Please review the estimate.",
    sendMeCopy: true,
  });

  const normalizeStatus = (status?: string) =>
    status?.trim().toLowerCase() || "";

  const getEstimateStatus = (item: any) =>
    normalizeStatus(item?.status || item?.stage || item?.emailStatus);

  const getStageLabel = (item: any) => {
    const normalizedStage = normalizeStatus(item?.stage);
    if (normalizedStage) return normalizedStage.replace(/_/g, " ").toUpperCase();

    const normalizedStatus = normalizeStatus(item?.status);
    if (normalizedStatus === "approved") return "INVOICED";
    if (normalizedStatus === "pending") return "ISSUED";
    if (normalizedStatus === "declined") return "DECLINED";
    return "UNKNOWN";
  };

  const getStageBadgeClasses = (item: any) => {
    const normalizedStage = normalizeStatus(item?.stage);
    const normalizedStatus = normalizeStatus(item?.status);

    if (normalizedStage === "draft") return "bg-[#FEE2E2] text-[#EF4444]";
    if (normalizedStage === "issued") return "bg-[#2196F333] text-[#2196F3]";
    if (normalizedStage === "invoiced") return "bg-[#2196F333] text-[#2196F3]";

    if (normalizedStatus === "approved") return "bg-[#2196F333] text-[#2196F3]";
    if (normalizedStatus === "pending") return "bg-[#2196F333] text-[#2196F3]";
    if (normalizedStatus === "declined") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  const getShortMetaDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return date
      .toLocaleDateString("en-US", { month: "short", day: "numeric" })
      .toUpperCase();
  };

  const getEstimateRef = (id?: string) => {
    if (!id) return "#----";
    return `#${id.slice(-4)}`;
  };

  const options = [
    { id: "description", label: "Description" },
    { id: "table", label: "Table Format" },
    // { id: "upload", label: "Upload Picture ,PDF , Document" },
  ];

  // FIXED: Case-insensitive filtering and search
  const filteredEstimates = estimates.filter((item: any) => {
    const itemStatus = getEstimateStatus(item);
    const matchesStatus = itemStatus === activeTab;
    if (!matchesStatus) return false;
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return true;

    const itemText = [
      item.estimateName,
      item.status,
      item.date,
      item.createdAt,
      item.client?.address,
      item.client?.city,
      item.client?.state,
      item.client?.zip,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return itemText.includes(normalizedSearch);
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredEstimates.length / pageSize),
  );
  const paginatedEstimates = filteredEstimates.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

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

  const grouped = paginatedEstimates.reduce((acc: any, item: any) => {
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

  const getEstimateDetailsFormat = (item: any) => {
    const formatValue =
      item?.detailsFormat || item?.format || item?.viewFormat || "description";

    return formatValue === "table" ? "table" : "description";
  };

  const getStatusBadgeClasses = (status?: string) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "approved") {
      return "bg-[#2196F333] text-[#2196F3]";
    }

    if (normalizedStatus === "pending") {
      return "bg-[#2196F333] text-[#2196F3]";
    }

    return "bg-red-100 text-red-600";
  };

  const getStatusLabel = (status?: string) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "pending") return "ISSUED";
    if (normalizedStatus === "approved") return "Invoiced";
    return status || "UNKNOWN";
  };

  const openEmailModal = (item: any) => {
    setSelectedEstimate(item);
    setEmailForm({
      to: item?.client?.email ? item.client.email : "",
      subject: "Your Estimate  from Geo Paving and Sealcoating",
      message:
        "We are pleased to work with you. Please review the estimate.",
      sendMeCopy: true,
    });
    setEmailModalOpen(true);
  };

  const handleSendEstimateEmail = async () => {
    if (!selectedEstimate?.id) return;

    const to = emailForm.to
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    if (to.length === 0) {
      toast.error("Please add at least one recipient email.");
      return;
    }

    try {
      await sendEmail({
        estimateId: selectedEstimate.id,
        to,
        cc: [],
        bcc: [],
        message: emailForm.message,
        sendMeCopy: emailForm.sendMeCopy,
        subject: emailForm.subject,
      }).unwrap();

      toast.success("Estimate email sent successfully");
      setEmailModalOpen(false);
      setSelectedEstimate(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send estimate email");
    }
  };

  return (
    <div className="md:bg-secondary bg-secondary-none p-4 md:p-6 rounded-2xl">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search estimates"
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search estimates"
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
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex items-center justify-center h-64 mt-10">
          <ColorRing
            visible={true}
            height="70"
            width="70"
            colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
          />
        </div>
      )}

      {/* LIST */}
      {!isLoading && (
        <div className="md:mt-10 md:space-y-6 ">
          {groupedEntries.length === 0 ? (
            <p className="text-center text-gray-400">
              No {activeTab} estimates found
            </p>
          ) : (
            groupedEntries.map((entry: any) => {
            const [, group] = entry;
            const month = group.label;
            const items = group.items;
            return (
              <div key={month}>
                {/* MONTH HEADER */}
                <div className="flex justify-between border-b pb-2 mb-4">
                  <span className="font-semibold text-xl">{month}</span>
                  <span className="text-gray-500 hidden md:block text-xl">
                    Total: $
                    {items
                      .reduce(
                        (sum: number, i: any) => sum + (i.grandTotal || 0),
                        0,
                      )
                      .toFixed(2)}
                  </span>
                </div>

                {items.map((item: any) => {
                  const isApproved = getEstimateStatus(item) === "approved";
                  const stageLabel = getStageLabel(item);
                  const stageClasses = getStageBadgeClasses(item);
                  const emailStatus = normalizeStatus(item.emailStatus);
                  const isEmailNotSent = emailStatus === "not_sent";
                  const showSignedIcon = Boolean(item?.isSigned) || isApproved;

                  return (
                    <div
                      key={item.id}
                      className="mb-4 border-b pb-4 last:border-b-0 last:pb-0 "
                    >
                      <div className="md:hidden rounded-2xl px-3 py-4 ">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-lg font-semibold text-gray-900 truncate">
                              {item.estimateName || "Untitled Estimate"}
                            </p>
                            
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-lg font-semibold text-gray-900">
                              ${item.grandTotal?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 text-base text-gray-500">
                          <span className="text-base text-gray-400 lowercase">
                            {`${getShortMetaDate(item.createdAt || item.date)} • ${getEstimateRef(item.id)}`}
                          </span>

                          <div className="inline-flex items-center gap-3 whitespace-nowrap">
                            {isEmailNotSent ? (
                              <button
                                type="button"
                              
                                className="inline-flex items-center "
                                aria-label="Open email"
                                title="Open email"
                              >
                                <MailOpen size={18} />
                              </button>
                            ) : isApproved ? (
                              <span
                                className="inline-flex items-center text-gray-500"
                                aria-label="Email opened"
                                title="Email opened"
                              >
                                <MailCheck size={18} />
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center text-gray-500"
                                aria-label="Email sent"
                                title="Email sent"
                              >
                                <MailCheck size={18} />
                              </span>
                            )}

                            {showSignedIcon && (
                              <span
                                className="inline-flex items-center text-gray-500"
                                aria-label="Signed"
                                title="Signed"
                              >
                                <FilePenLine size={15} />
                              </span>
                            )}

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${stageClasses}`}
                            >
                              {stageLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex md:flex-row md:items-start md:justify-between gap-4 md:pb-0 md:border-0">
                        <div className="flex-1 md:flex-none md:w-[30%]">
                          <div className="flex items-center justify-between gap-2 w-full">
                            <span className="font-semibold text-gray-800 lg:border-b lg:border-[#52C41A]">
                              {item.estimateName || "Untitled Estimate"}
                            </span>
                            <span className="block md:hidden font-medium text-gray-600">
                              ${item.grandTotal?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4 mt-1 text-gray-800 p-2 w-full">
                            <p className="text-base text-gray-400">
                              {item.createdAt
                                ? formatDate(item.createdAt)
                                : item.date || "-"}
                            </p>
                            <span
                              className={`px-3 py-1 text-base rounded-full md:hidden block ${stageClasses}`}
                            >
                              <span className="text-base font-medium">
                                {stageLabel}
                              </span>
                            </span>
                          </div>
                        </div>

                        <div className="hidden md:block">
                        <span
                            className={`px-3 py-1 text-base rounded-full ${stageClasses}`}
                        >
                          <span className="text-base font-medium">
                              {stageLabel}
                          </span>
                        </span>
                      </div>

                        <div className="text-base text-gray-500 max-w-xs hidden md:block md:w-[20%]">
                          <p>{item?.client?.address}</p>
                          <p>{item?.client?.city}</p>
                          <p>{item?.client?.state}</p>
                          <p>{item?.client?.zip}</p>
                        </div>

                        <div className="text-left hidden md:block md:w-[15%]">
                          <p className="font-semibold">
                            ${item.grandTotal?.toFixed(2) || "0.00"}
                          </p>

                          <div className="mt-1 flex items-center gap-3 text-gray-500">
                            {isEmailNotSent ? (
                              <button
                                type="button"
                                onClick={() => openEmailModal(item)}
                                className="inline-flex items-center gap-1  hover:text-primary/80"
                                aria-label="Open email"
                                title="Open email"
                              >
                                <MailOpen size={18} />
                                <span className="text-base">Open Email</span>
                              </button>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1"
                                aria-label={isApproved ? "Email opened" : "Email sent"}
                                title={isApproved ? "Email opened" : "Email sent"}
                              >
                                <MailCheck size={18} />
                                <span className="text-base">
                                  {isApproved ? "Email Opened" : "Email Sent"}
                                </span>
                              </span>
                            )}

                            {showSignedIcon && (
                              <span
                                className="inline-flex items-center"
                                aria-label="Signed"
                                title="Signed"
                              >
                                <FilePenLine size={15} />
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="hidden md:flex md:gap-2 md:w-[15%] md:justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              router.push(
                                `/admin/estimate/${item.id}?format=${getEstimateDetailsFormat(item)}`,
                              );
                            }}
                            className="px-4 py-2 border border-primary text-primary rounded-lg whitespace-nowrap"
                          >
                            Open
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              router.push(`/admin/edit-estimate?id=${item.id}`);
                            }}
                            className="px-4 py-2 bg-primary text-secondary rounded-lg whitespace-nowrap"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
      )}

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
                localStorage.setItem("estimateDetailsFormat", "description");
                router.push("/admin/estimate/estimate-description");
              } else if (selected === "table") {
                localStorage.setItem("estimateDetailsFormat", "table");
                router.push("/admin/estimate/estimate-description");
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
