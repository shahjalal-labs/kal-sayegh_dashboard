"use client";

import logo from "@/assets/kal-logo.png";
import {
  useGetInvoiceByIdQuery,
  useSendInvoiceMailMutation,
} from "@/redux/api/admin/invoiceApi";
import html2pdf from "html2pdf.js";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";

import paymentIcon from "@/assets/dashboard/credit-card-validation.png";
import Conditions from "@/components/Conditions";
import PaymentModal from "./Payment/PaymentModal";

export default function InvoiceDetailsDescription() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const formatParam = searchParams?.get("format");

  const { data, isLoading, error, refetch } = useGetInvoiceByIdQuery(
    id as string,
  );
  const invoice = (data as any)?.result;
  const editInvoiceId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : invoice?.id || "";

  const clientEmail = invoice?.client?.email || "";

  // email/reminder modal state
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emailMarkedRead, setEmailMarkedRead] = useState(false);
  const [formData, setFormData] = useState<{
    to: string[];
    subject: string;
    message: string;
    sendMeCopy: boolean;
  }>({
    to: [],
    subject: "",
    message:
      "We are following up to confirm whether you have had an opportunity to review the invoice that was previously sent.",
    sendMeCopy: false,
  });
  const [showClientEmail, setShowClientEmail] = useState(false);

  const [sendInvoiceMail, { isLoading: isSendingInvoiceEmail }] =
    useSendInvoiceMailMutation();

  // Mark email as READ when opened with format=description
  useEffect(() => {
    if (!id || !invoice || formatParam !== "description") return;
    if (emailMarkedRead) return;

    (async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_LOCAL}/invoice/update-email-sign/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify({ emailStatus: "READ" }),
          },
        );

        if (response.ok) {
          setEmailMarkedRead(true);
          refetch();
        }
      } catch (err) {
        // silently ignore errors
      }
    })();
  }, [id, invoice, formatParam, emailMarkedRead, refetch]);

  // when invoice loaded, set client email in recipients (keep hook order stable)
  useEffect(() => {
    if (!invoice || showClientEmail) return;
    const cEmail = invoice?.client?.email;
    if (cEmail) {
      setFormData((prev) => ({ ...prev, to: [cEmail, ...prev.to] }));
      setShowClientEmail(true);
    }
  }, [invoice, showClientEmail]);

  const handleDownload = () => {
    const element = document.getElementById("invoice");
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `${invoice?.invoiceName || "invoice"}.pdf`,
      image: {
        type: "jpeg" as const,
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait" as const,
      },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (isLoading) {
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
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/invoice"
          className="flex items-center gap-2 hover:underline"
        >
          <FiArrowLeft />
          Back To Invoice List Page
        </Link>
        <p className="text-red-500">Failed to load invoice details.</p>
      </div>
    );
  }

  const sideMapUrls = Array.isArray(invoice?.sideMap)
    ? invoice.sideMap
    : invoice?.sideMap
      ? [invoice.sideMap]
      : [];

  const fileUrls = Array.isArray(invoice?.fileUrls) ? invoice.fileUrls : [];
  const invoiceItems = Array.isArray(invoice?.items) ? invoice.items : [];

  const subtotal = invoiceItems.reduce((sum: number, item: any) => {
    return sum + (Number(item?.subTotal) || 0);
  }, 0);

  const clientAddress = [
    invoice?.client?.address,
    invoice?.client?.city,
    invoice?.client?.state,
    invoice?.client?.zip,
  ]
    .filter(Boolean)
    .join(", ");

  const scopeSummary = invoiceItems
    .map((item: any) => item?.description)
    .filter(Boolean)
    .join(", ");

  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

  // add email to recipients list
  const addRecipientEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const emails = trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const valid = emails.filter((e) => /\S+@\S+\.\S+/.test(e));
    if (valid.length > 0) {
      setFormData((prev) => ({ ...prev, to: [...prev.to, ...valid] }));
      setEmailInput("");
    }
  };

  const handleInvoiceReminder = async () => {
    if (!invoice) return;
    try {
      const to = formData.to.map((s) => s.trim()).filter(Boolean);
      await sendInvoiceMail({
        invoiceId: invoice.id,
        payload: {
          to,
          cc: [],
          bcc: [],
          message: formData.message,
          sendMeCopy: formData.sendMeCopy,
          subject: formData.subject,
        },
      }).unwrap();

      toast.success("Invoice email sent successfully");
      setIsReminderOpen(false);
      setFormData({ to: [], subject: "", message: "", sendMeCopy: false });
      setEmailInput("");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send invoice email");
    }
  };

  return (
    <div className="pb-10">
      <div className="flex gap-20 items-center px-4 md:px-0">
        <Link
          href="/admin/invoice"
          className="flex items-center gap-2 hover:underline text-gray-500"
        >
          <FiArrowLeft size={25} />
          <span className="hidden md:block"> Back To Invoice List Page</span>
        </Link>

        <h1 className="text-2xl font-bold text-center mt-4 md:hidden block">
          Invoice Details
        </h1>
      </div>

      <div>
        <div className="hidden md:flex md:flex-row md:justify-between  ">
          <div className="flex items-center  gap-3 mt-4">
            {/* <Link
            href={
              editInvoiceId
                ? `/admin/edit-invoice?id=${editInvoiceId}&format=table`
                : "/admin/invoice"
            }
            onClick={() => {
              if (typeof window !== "undefined" && editInvoiceId) {
                localStorage.setItem("editingInvoiceId", editInvoiceId);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <Edit size={16} />
            Edit
          </Link> */}

            <button
              onClick={() => setIsReminderOpen(true)}
              className="flex items-center gap-2 px-4 py-2 mt-7 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
            >
              <AiOutlineMail />
              Email
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="group flex items-center gap-2 px-4 py-2 border-primary transition-all duration-300 border text-primary rounded-lg hover:bg-primary hover:text-white ease-in"
            >
              <Image
                src={paymentIcon}
                alt="Payment"
                width={20}
                height={20}
                className="transition duration-300 group-hover:brightness-0 group-hover:invert"
              />
              Payment
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
            >
              <FiDownload />
              Download
            </button>
          </div>
        </div>
      </div>

      {(emailMarkedRead ||
        (invoice?.emailStatus || "").toString().toUpperCase() === "READ") && (
        <div className="mt-3 text-center text-sm text-green-700 bg-green-50 rounded-md py-2 px-3">
          ✓ Email opened
        </div>
      )}

      <div
        id="invoice"
        className="mt-4 bg-secondary rounded-2xl p-4 md:p-6 py-9"
      >
        <h1 className="text-center font-semibold tracking-[0.16em] text-xl text-gray-400 uppercase">
          Invoice
        </h1>

        <div className="flex justify-between items-start mt-5">
          <Image
            src={logo}
            alt="Logo"
            width={150}
            height={80}
            className="h-auto w-[150px] md:w-[200px]"
          />

          <div className="text-right text-[10px] leading-5 text-gray-700 space-y-3 text-base">
            <p className="font-semibold text-black text-xl">Prepared For</p>
            <p>{invoice?.client?.clientName || "-"}</p>
            <p>{invoice?.client?.address || "-"}</p>
            <p>{invoice?.client?.city || "-"}</p>
            <p>{invoice?.client?.zip || "-"}</p>
            <p>{invoice?.client?.phoneNumber || "-"}</p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] leading-5 text-gray-700">
          <div className="text-base space-y-3">
            <h2 className="text-xl font-semibold text-black">
              Geo Paving and Sealcoating
            </h2>
            <p>9530 Juniper Crest Ct, Ste 1012 Rancho</p>
            <p>Cucamonga, CA 91730</p>
            <p>Phone: (626) 447-0525</p>
            <p>
              Email: <span className="text-black">info@geopaving.com</span>
            </p>
            <p>
              Web: <span className="text-black">www.geopaving.com</span>
            </p>
          </div>

          <div className="space-y-3 md:justify-self-end text-left md:text-right text-base">
            <p>
              <span className="font-semibold text-black">Invoice</span>
              <span className="inline-block w-6 text-center">:</span>#
              {invoice?.id?.slice(-4) || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Date</span>
              <span className="inline-block w-6 text-center">:</span>
              {invoice?.date || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Status</span>
              <span className="inline-block w-6 text-center">:</span>
              {invoice?.status || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Business / Tax #</span>
              <span className="inline-block w-6 text-center">:</span>
              {invoice?.client?.zip || "-"}
            </p>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex justify-between border-b border-[#cfcfcf] pb-2 text-xl font-semibold text-black">
            <h2>Description</h2>
            <p>Total</p>
          </div>

          {invoiceItems.length > 0 ? (
            invoiceItems.map((item: any, index: number) => (
              <div
                key={item?.id || index}
                className="flex justify-between gap-4 border-b border-[#e1e1e1] py-3 text-base leading-6 text-gray-700"
              >
                <p className="max-w-[70%] font-semibold text-gray-500">
                  {item?.description || "No description"}
                </p>
                <p className="font-semibold text-black whitespace-nowrap">
                  ${(Number(item?.subTotal) || 0).toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div className="flex justify-between border-b border-[#e1e1e1] py-3 text-base text-gray-700">
              <p>No items</p>
              <p>$0.00</p>
            </div>
          )}

          <div className="mt-2 flex justify-end">
            <div className="w-full max-w-[250px] space-y-2 text-base">
              <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                <p className="font-semibold">Subtotal</p>
                <p className="font-semibold">${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                <p className="font-semibold">Total</p>
                <p className="font-semibold">
                  ${(Number(invoice?.grandTotal) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-16 space-y-4 border-t-2 py-2 border-orange-200">
            <div>
              {sideMapUrls.length > 0 ? (
                <div className=" gap-3 flex flex-col-reverse ">
                  {sideMapUrls.map((url: string, index: number) => (
                    <div
                      key={`side-map-${index}`}
                      className="border border-[#dfdfdf]  "
                    >
                      {isVideoUrl(url) ? (
                        <video
                          controls
                          className="w-full h-auto rounded-sm border border-orange-200"
                        >
                          <source src={url} />
                        </video>
                      ) : (
                        <Image
                          src={url}
                          alt={`Side Map ${index + 1}`}
                          width={900}
                          height={520}
                          className="w-full md:h-[700px] object-contain border-2 border-orange-200"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center border-b items-center border-2 border-orange-200 h-[250px]  md:h-[350px] bg-[#f9f9f9] py-3 text-2xl text-center text-gray-700 ">
                  <p>No side map</p>
                </div>
              )}

              <div className="border-2  border-orange-200 bg-[#f9f9f9] ">
                <div className="grid grid-cols-1 md:grid-cols-3 text-base text-gray-700">
                  {/* LEFT: Company Info */}
                  <div className="p-4 md:border-r-2 border-orange-200 space-y-2">
                    <Image
                      src={logo}
                      alt="Geo Paving"
                      width={120}
                      height={50}
                      className="h-auto w-[120px]"
                    />
                    <p>Cucamonga, CA 91730</p>
                    <p>Phone: (951) 469-7002</p>
                    <p>Email: geopaving@gmail.com</p>
                    <p>Web: www.geopaving.com</p>
                  </div>

                  {/* MIDDLE: Client Info */}
                  <div className="p-4 border-t-2 border-orange-200 md:border-t-0 md:border-r-2 space-y-2">
                    <p className="font-semibold text-gray-800">
                      {invoice?.client?.clientName || "-"}
                    </p>
                    <p>{clientAddress || "-"}</p>
                    <p>{invoice?.client?.phoneNumber || "-"}</p>
                  </div>

                  {/* RIGHT: Project Info */}
                  <div className="p-4 border-t-2 border-orange-200 md:border-t-0 space-y-2">
                    <p className="font-semibold text-gray-800">
                      {invoice?.invoiceName || "-"}
                    </p>
                    <p>{scopeSummary || "-"}</p>
                  </div>
                </div>
              </div>
            </div>

            {fileUrls.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {fileUrls.map((url: string, index: number) => (
                  <div
                    key={`file-${index}`}
                    className="border border-[#dfdfdf] bg-white p-2"
                  >
                    {isVideoUrl(url) ? (
                      <video controls className="w-full h-auto rounded-sm">
                        <source src={url} />
                      </video>
                    ) : (
                      <Image
                        src={url}
                        alt={`File ${index + 1}`}
                        width={900}
                        height={520}
                        className="w-full md:h-[700px] object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className=" bg-[#f9f9f9] h-[250px] md:h-[350px] py-8 text-center text-2xl text-gray-500 flex justify-center items-center border-2 border-orange-200">
                No files map
              </div>
            )}
          </div>
        </div>

        <div className="my-10 px-4">
          <Conditions />
        </div>
      </div>

      <div>
        <div className="md:hidden flex flex-wrap gap-3 md:justify-between  ">
          <div className="flex items-center  gap-3 mt-4">
            {/* <Link
            href={
              editInvoiceId
                ? `/admin/edit-invoice?id=${editInvoiceId}&format=table`
                : "/admin/invoice"
            }
            onClick={() => {
              if (typeof window !== "undefined" && editInvoiceId) {
                localStorage.setItem("editingInvoiceId", editInvoiceId);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <Edit size={16} />
            Edit
          </Link> */}
          </div>

          <div className="flex items-center gap-3 px-4">
            <button
              onClick={() => setIsReminderOpen(true)}
              className="flex items-center gap-2 px-4 py-2  border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary text-sm"
            >
              <AiOutlineMail />
              Email
            </button>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="group flex items-center gap-2 px-4 py-2 border-primary transition-all duration-300 border text-primary rounded-lg hover:bg-primary hover:text-white ease-in text-sm"
            >
              <Image
                src={paymentIcon}
                alt="Payment"
                width={20}
                height={20}
                className="transition duration-300 group-hover:brightness-0 group-hover:invert"
              />
              Payment
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 text-sm"
            >
              <FiDownload />
              Download
            </button>
          </div>
        </div>
      </div>
      {/* <div className="flex gap-3 mt-6 justify-end">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
        >
          <FiPrinter />
          Print
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
        >
          <FiDownload />
          Download
        </button>
      </div> */}
      {isReminderOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setIsReminderOpen(false);
          }}
        >
          <div
            className="w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Send Payment Reminder
            </h2>

            <div className="mt-8 space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  To
                </label>

                <div className="flex min-h-[48px] w-full flex-wrap items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-primary">
                  {showClientEmail && clientEmail ? (
                    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                      <span>{clientEmail}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowClientEmail(false);
                          setFormData((prev) => ({
                            ...prev,
                            to: prev.to.filter(
                              (email) => email !== clientEmail,
                            ),
                          }));
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Remove client email"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}

                  {formData.to.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            to: prev.to.filter((item) => item !== email),
                          }));
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remove ${email}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <input
                    type="text"
                    placeholder="Add email..."
                    value={emailInput}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setEmailInput(event.target.value);
                    }}
                    onKeyDown={(
                      event: React.KeyboardEvent<HTMLInputElement>,
                    ) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addRecipientEmail(emailInput);
                      }
                    }}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-500 outline-none placeholder:text-gray-400 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      sendMeCopy: !prev.sendMeCopy,
                    }))
                  }
                  className={`relative inline-flex h-8 w-16 items-center rounded-full px-1 transition-colors ${
                    formData.sendMeCopy ? "bg-primary" : "bg-gray-200"
                  }`}
                  aria-label="Send me a copy toggle"
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      formData.sendMeCopy ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Send me a copy
                </span>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  className="min-h-[120px] w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-600 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-end gap-5">
              <button
                type="button"
                onClick={() => setIsReminderOpen(false)}
                className="min-w-[112px] rounded-xl border border-primary px-6 py-3 text-base text-primary transition-colors hover:bg-primary hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleInvoiceReminder}
                type="button"
                className="min-w-[112px] rounded-xl bg-primary px-6 py-3 text-base text-white transition-colors hover:opacity-90"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {isPaymentModalOpen && (
        <PaymentModal
          onClose={() => setIsPaymentModalOpen(false)}
          invoiceId={editInvoiceId}
          recipientEmails={invoice?.client?.email ? [invoice.client.email] : []}
        />
      )}
    </div>
  );
}
