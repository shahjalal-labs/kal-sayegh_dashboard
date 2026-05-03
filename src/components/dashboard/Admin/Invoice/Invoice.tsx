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
import { useGetAllInvoiceQuery, useSendInvoiceMailMutation } from "@/redux/api/admin/invoiceApi";
import { Check, MailCheck, MailOpen, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Invoice() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    message: "",
    sendMeCopy: false,
  });

  const [sendInvoiceMail, { isLoading: isSendingInvoiceEmail }] = useSendInvoiceMailMutation();

  const { data: invoicesData, refetch } = useGetAllInvoiceQuery({ limit: pageSize, page, searchTerm: searchTerm });

  // API returns { success, message, result: { meta, data } }
  const apiResult = invoicesData?.result;
  const rawInvoices = apiResult?.data || [];
  // client-side tab filtering (api doesn't accept status param)
  const invoices = rawInvoices.filter((inv: any) => {
    if (activeTab === "paid") return String(inv.status).toUpperCase() === "PAID";
    return String(inv.status).toUpperCase() === "ACTIVE" || String(inv.status).toUpperCase() === "ACTIVE";
  });

  const totalPages = apiResult?.meta?.totalPages || 1;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeTab]);

  const parseDate = (dateString?: string) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const formatMonthYear = (dateString?: string) => {
    const date = parseDate(dateString) || new Date();
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getMonthKey = (item: any) => {
    const date = parseDate(item.createdAt || item.date);
    return date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}` : "unknown";
  };

  const grouped = (invoices || []).reduce((acc: any, item: any) => {
    const key = getMonthKey(item);
    const label = item.createdAt || item.date ? formatMonthYear(item.createdAt || item.date) : "Unknown";
    if (!acc[key]) acc[key] = { label, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  const groupedEntries = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));

  const openEmailModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setEmailForm({
      to: invoice?.client?.email || "",
      subject: `Invoice ${invoice?.invoiceName || getInvoiceRef(invoice?.id)}`,
      message: invoice?.emailMessage || "",
      sendMeCopy: false,
    });
    setEmailModalOpen(true);
  };

  const isEmailNotSent = (status?: string) => !status || status === "NOT_SENT" || status === "not_sent";

  const getInvoiceEmailLabel = (status?: string) => {
    if (isEmailNotSent(status)) return "Open Email";
    return "Email Sent";
  };

  const getInvoiceEmailTextClass = (status?: string) => (isEmailNotSent(status) ? "text-gray-500 hover:text-primary" : "");

  const getInvoiceEmailIcon = (status?: string) =>
    isEmailNotSent(status) ? (
      <MailOpen size={18} />
    ) : (
      <MailCheck size={18} />
    );

  const normalizeStatus = (status?: string) => status?.toString().trim().toLowerCase() || "";

  const getInvoiceStatusLabel = (item: any) => {
    const normalizedStage = normalizeStatus(item?.stage);
    if (normalizedStage) return normalizedStage.replace(/_/g, " ").toUpperCase();

    const normalizedStatus = normalizeStatus(item?.status);
    if (normalizedStatus === "approved") return "INVOICED";
    if (normalizedStatus === "pending") return "ISSUED";
    if (normalizedStatus === "declined") return "DECLINED";
    return (item?.emailStatus || "").toString().toUpperCase() || "UNKNOWN";
  };

  const getInvoiceStatusClasses = (item: any) => {
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

  const getDisplayDate = (dateString?: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";

    const day = date.getDate();
    const ordinalSuffix = (value: number) => {
      const remainder = value % 10;
      const tens = value % 100;
      if (remainder === 1 && tens !== 11) return "st";
      if (remainder === 2 && tens !== 12) return "nd";
      if (remainder === 3 && tens !== 13) return "rd";
      return "th";
    };

    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${month} ${day}${ordinalSuffix(day)} ${year}`;
  };

  const getInvoiceRef = (id?: string) => {
    if (!id) return "#----";
    return `#${id.slice(-4)}`;
  };

  const handleSendInvoiceEmail = async () => {
    if (!selectedInvoice) return;
    try {
      const to = emailForm.to.split(",").map((s) => s.trim()).filter(Boolean);
      await sendInvoiceMail({ invoiceId: selectedInvoice.id, payload: {
        to,
        cc: [],
        bcc: [],
        message: emailForm.message,
        sendMeCopy: emailForm.sendMeCopy,
        subject: emailForm.subject,
      } }).unwrap();

      toast.success("Invoice email sent successfully");
      setEmailModalOpen(false);
      setSelectedInvoice(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send invoice email");
    }
  };

  const options = [
    { id: "description", label: "Description format" },
    { id: "table", label: "Table format" },
  ];

  const totalPagesCount = totalPages;

  return (
    <div className=" ">
      <div className=" p-4 rounded-t-2xl bg-secondary  py-10">
        <div className="flex items-center justify-between md:flex-row md:items-center md:justify-between gap-4 ">
          <h2 className="text-lg md:text-2xl font-normal">
            <span className="block md:hidden">Invoices</span>
            <span className="hidden md:block ">Invoice List</span>
          </h2>

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

        <div className="flex gap-4 md:gap-6 mt-8 bg-[#D8DBDF] p-2 rounded-xl md:rounded-none">
          {["active", "paid"].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`w-full py-3 rounded-xl md:rounded-lg capitalize ${
                activeTab === status ? "bg-white text-primary" : " "
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="md:space-y-6 ">
        {groupedEntries.length === 0 ? (
          <p className="text-center text-gray-400">No {activeTab} invoices found</p>
        ) : (
          groupedEntries.map(([_, group]: any) => {
            const month = group.label;
            const items = group.items;
            return (
              <div key={month} className="mb-6 bg-secondary rounded-lg py-4">
                <div className=" rounded-t-lg md:rounded-none flex justify-between items-center border-b">
                  <span className="font-semibold text-xl md:text-2xl leading-none md:leading-normal px-6 py-3">{month}</span>
                  <span className="font-semibold text-xl md:text-2xl leading-none md:leading-normal text-gray-900 px-4">$
                    {items.reduce((sum: number, i: any) => sum + (i.grandTotal || 0), 0).toFixed(2)}
                  </span>
                </div>

                <div className=" rounded-b-lg md:rounded-lg p-4 md:p-6">
                  {items.map((item: any) => (
                    <div key={item.id} className="mb-3 border-b pb-3 last:border-b-0 last:pb-0 ">
                      <div className="md:hidden px-2 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-lg font-semibold leading-tight text-gray-900">
                              {item.invoiceName} - {getInvoiceRef(item.id)}
                            </p>
                            <div className="mt-1 h-px w-full bg-[#cfe8c7]" />
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-lg font-semibold leading-tight text-gray-900">
                              ${item.grandTotal?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-3">
                          <p className="text-base text-gray-500">
                            {getDisplayDate(item.createdAt || item.date)}
                          </p>

                          <div className="flex shrink-0 items-center gap-3">
                            {isEmailNotSent(item.emailStatus) ? (
                              <button
                                type="button"
                                onClick={() => openEmailModal(item)}
                                className={`inline-flex items-center ${getInvoiceEmailTextClass(item.emailStatus)}`}
                                aria-label={getInvoiceEmailLabel(item.emailStatus)}
                                title={getInvoiceEmailLabel(item.emailStatus)}
                              >
                                  {getInvoiceEmailIcon(item.emailStatus)}
                              </button>
                            ) : (
                              <span
                                className={`inline-flex items-center ${getInvoiceEmailTextClass(item.emailStatus)}`}
                                aria-label={getInvoiceEmailLabel(item.emailStatus)}
                                title={getInvoiceEmailLabel(item.emailStatus)}
                              >
                                  {getInvoiceEmailIcon(item.emailStatus)}
                              </span>
                            )}

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getInvoiceStatusClasses(item)}`}
                            >
                              {getInvoiceStatusLabel(item)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="hidden md:flex md:flex-row md:items-center md:justify-between gap-4 md:pb-0 md:border-0">
                        <div className="flex-1 md:flex-none md:w-[30%] ">
                          <div className="flex items-center justify-between gap-2 w-full ">
                            <span className="font-semibold text-gray-800 border-[#52C41A] border-b">{item.invoiceName || "Untitled Invoice"}</span>
                          </div>
                        <div className="flex items-center justify-between gap-4 mt-1 text-gray-800 p-2 w-full ">
  <p className="text-lg text-gray-400 ">
    {item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : item.date || "-"}
  </p>
</div>
                        </div>

                        <div className="md:block hidden">
                          <span className={`px-3 py-1 text-base  rounded-full ${getInvoiceStatusClasses(item)}`}>
                            <span className="text-base  font-medium">{getInvoiceStatusLabel(item)}</span>
                          </span>
                        </div>

                        <div className="text-base  text-gray-500 max-w-xs hidden md:block md:w-[20%]">
                          <p>{item?.client?.address}</p>
                          <p>{item?.client?.city}</p>
                          <p>{item?.client?.state}</p>
                          <p>{item?.client?.zip}</p>
                        </div>

                        <div className="text-left hidden md:block md:w-[15%]">
                          <p className="font-semibold">${item.grandTotal?.toFixed(2) || "0.00"}</p>
                          {isEmailNotSent(item.emailStatus) ? (
                            <button type="button" onClick={() => openEmailModal(item)} className={`text-base flex items-center gap-2 ${getInvoiceEmailTextClass(item.emailStatus)}`}>
                              {getInvoiceEmailIcon(item.emailStatus)} {getInvoiceEmailLabel(item.emailStatus)}
                            </button>
                          ) : (
                            <p className={`text-base flex items-center gap-2 ${getInvoiceEmailTextClass(item.emailStatus)}`}>
                              {getInvoiceEmailIcon(item.emailStatus)} {getInvoiceEmailLabel(item.emailStatus)}
                            </p>
                          )}
                        </div>

                        <div className="hidden md:flex md:gap-2 md:w-[15%] md:justify-end">
                          <button type="button" onClick={() => router.push(`/admin/invoice/${item.id}?format=${localStorage.getItem("invoiceDetailsFormat") === "table" ? "table" : "description"}`)} className="px-4 py-2 border border-primary text-primary hover:bg-primary/90 transition-colors hover:text-white rounded-lg whitespace-nowrap">Open</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalPagesCount > 1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-b-2xl  p-3 md:flex-row md:px-4 md:py-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" onClick={(event) => { event.preventDefault(); if (page > 1) setPage(page - 1); }} />
              </PaginationItem>

              {Array.from({ length: totalPagesCount }, (_, idx) => idx + 1).map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink href="#" isActive={pageNumber === page} onClick={(event) => { event.preventDefault(); setPage(pageNumber); }}>
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext href="#" onClick={(event) => { event.preventDefault(); if (page < totalPagesCount) setPage(page + 1); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <CustomModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Line item"
        actions={[
          { label: "Close", variant: "secondary", onClick: () => setIsOpen(false) },
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
            <div key={item.id} onClick={() => setSelected(item.id)} className="flex items-center justify-between border rounded-lg p-3 cursor-pointer">
              <input type="text" readOnly value={item.label} className="w-full bg-transparent outline-none cursor-pointer" />
              <div className="w-5 h-5 flex items-center justify-end">{selected === item.id && <Check className="text-white bg-primary rounded-full p-1" size={20} />}</div>
            </div>
          ))}
        </div>
      </CustomModal>

      <CustomModal
        open={emailModalOpen}
        onClose={() => { setEmailModalOpen(false); setSelectedInvoice(null); }}
        title="Send Invoice Email"
        maxWidth="lg"
        actions={[
          { label: "Cancel", variant: "secondary", onClick: () => { setEmailModalOpen(false); setSelectedInvoice(null); } },
          { label: isSendingInvoiceEmail ? "Sending..." : "Send Email", variant: "primary", onClick: handleSendInvoiceEmail, disabled: isSendingInvoiceEmail },
        ]}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-base  font-medium text-gray-700">To</label>
            <input type="text" value={emailForm.to} onChange={(e) => setEmailForm((prev) => ({ ...prev, to: e.target.value }))} placeholder="recipient@example.com" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none" />
            <p className="mt-1 text-base  text-gray-500">Use comma to add multiple recipients.</p>
          </div>

          <div>
            <label className="mb-1 block text-base  font-medium text-gray-700">Subject</label>
            <input type="text" value={emailForm.subject} onChange={(e) => setEmailForm((prev) => ({ ...prev, subject: e.target.value }))} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none" />
          </div>

          <div>
            <label className="mb-1 block text-base  font-medium text-gray-700">Message</label>
            <textarea value={emailForm.message} onChange={(e) => setEmailForm((prev) => ({ ...prev, message: e.target.value }))} rows={6} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none" />
          </div>

          <label className="flex items-center gap-2 text-base  text-gray-700">
            <input type="checkbox" checked={emailForm.sendMeCopy} onChange={(e) => setEmailForm((prev) => ({ ...prev, sendMeCopy: e.target.checked }))} className="h-4 w-4" />
            Send me a copy
          </label>
        </div>
      </CustomModal>
    </div>
  );
}
