"use client";

import paymentIcon from "@/assets/dashboard/credit-card-validation.png";
import logo from "@/assets/kal-logo.png";
import {
  useGenerateFromEstimateMutation,
  useGetInvoiceByIdQuery,
  useSendReminderEmailMutation,
} from "@/redux/api/admin/invoiceApi";
import html2pdf from "html2pdf.js";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";
import Swal from "sweetalert2";
import PaymentModal from "./Payment/PaymentModal";

export default function InvoiceDetailsTableFormat() {
  const { id } = useParams();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [showClientEmail, setShowClientEmail] = useState(true);
  const [emailInput, setEmailInput] = useState("");

  const { data, isLoading, error } = useGetInvoiceByIdQuery(id as string);
  const invoice = (data as any)?.result;
  const clientEmail = invoice?.client?.email || "";

  const [invoiceReminder, { isLoading: isSendingReminder }] =
    useSendReminderEmailMutation();

  const [generateFromEstimate, { isLoading: isGeneratingInvoice }] =
    useGenerateFromEstimateMutation();

  const [formData, setFormData] = useState({
    message: "",
    sendMeCopy: false,
    subject: "",
    to: [] as string[],
  });

  const editInvoiceId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : invoice?.id || "";

  const addRecipientEmail = (rawEmail: string) => {
    const trimmedEmail = rawEmail.trim();
    if (!trimmedEmail) return;

    setFormData((prev) => {
      if (prev.to.includes(trimmedEmail)) return prev;
      return {
        ...prev,
        to: [...prev.to, trimmedEmail],
      };
    });

    setEmailInput("");
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const normalizedItems = Array.isArray(invoice?.items) ? invoice.items : [];

  const handleDownload = () => {
    const element = document.getElementById("invoice");
    if (!element) return;

    const tableWrapper = element.querySelector(
      "[data-pdf-table-wrapper]",
    ) as HTMLElement | null;
    const tableElement = element.querySelector(
      "[data-pdf-table]",
    ) as HTMLElement | null;

    const wrapperOverflow = tableWrapper?.style.overflowX;
    const tableMinWidth = tableElement?.style.minWidth;
    const tableWidth = tableElement?.style.width;
    const tableLayout = tableElement?.style.tableLayout;
    const elementPadding = element.style.padding;
    const elementBorderRadius = element.style.borderRadius;

    if (tableWrapper) {
      tableWrapper.style.overflowX = "visible";
    }

    if (tableElement) {
      tableElement.style.minWidth = "0";
      tableElement.style.width = "100%";
      tableElement.style.tableLayout = "fixed";
    }

    element.style.padding = "32px";
    element.style.borderRadius = "0";

    const opt = {
      margin: 0.4,
      filename: `${invoice?.invoiceName || "invoice"}.pdf`,
      image: {
        type: "jpeg" as const,
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
        useCORS: true,
        windowWidth: element.scrollWidth,
      },
      jsPDF: {
        unit: "in",
        format: "a4",
        orientation: "portrait" as const,
      },
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .finally(() => {
        if (tableWrapper) {
          tableWrapper.style.overflowX = wrapperOverflow || "";
        }
        if (tableElement) {
          tableElement.style.minWidth = tableMinWidth || "";
          tableElement.style.width = tableWidth || "";
          tableElement.style.tableLayout = tableLayout || "";
        }
        element.style.padding = elementPadding || "";
        element.style.borderRadius = elementBorderRadius || "";
      });
  };

  const handleSendEstimateEmail = async () => {
    setIsReminderOpen(true);
  };

  const handleInvoiceReminder = async () => {
    try {
      const reminderRecipients = Array.from(
        new Set(
          [
            ...formData.to,
            ...(showClientEmail && clientEmail ? [clientEmail] : []),
          ].filter(Boolean),
        ),
      );

      if (!editInvoiceId) {
        await Swal.fire({
          title: "Failed",
          text: "Invoice id is missing.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      if (reminderRecipients.length === 0) {
        await Swal.fire({
          title: "Recipients Required",
          text: "Please add at least one recipient email.",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      await invoiceReminder({
        invoiceId: editInvoiceId,
        message: formData.message,
        sendMeCopy: formData.sendMeCopy,
        subject: formData.subject,
        to: reminderRecipients,
      }).unwrap();

      await Swal.fire({
        title: "Sent",
        text: "Invoice email sent successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });

      setFormData({
        message: "",
        sendMeCopy: false,
        subject: "",
        to: [],
      });
      setEmailInput("");
      setShowClientEmail(true);
      setIsReminderOpen(false);
    } catch (error) {
      await Swal.fire({
        title: "Failed",
        text: "Failed to send invoice email. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleGenerateInvoice = async () => {
    if (!invoice?.estimateId) {
      toast.error("This invoice was not created from an estimate.");
      return;
    }

    try {
      await generateFromEstimate({ estimateId: invoice.estimateId }).unwrap();
      toast.success("Invoice generated successfully");
    } catch (error) {
      toast.error("Failed to generate invoice.");
    }
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
          <span className="text-gray-500 ">Back To Invoice List Page</span>
        </Link>
        <p className="text-red-500">Failed to load invoice details.</p>
      </div>
    );
  }

  const unitCost =
    normalizedItems.length > 0
      ? (invoice?.grandTotal || 0) / normalizedItems.length
      : invoice?.grandTotal || 0;

  return (
    <div>
      <div className="text-center flex  gap-16 items-center mt-8 px-4 md:px-0">
        <Link
          href="/admin/invoice"
          className="flex items-center gap-2 hover:underline text-gray-500"
        >
          <FiArrowLeft size={20} />
          <span className="text-gray-500 hidden md:block">
            Back To Invoice List Page
          </span>
        </Link>
        <h1 className="text-center block  md:hidden text-2xl">
          Invoice Details
        </h1>
      </div>

      <div className="hidden md:flex md:flex-row md:justify-between mt-7 ">
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
            onClick={handleSendEstimateEmail}
            disabled={isSendingReminder}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
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

      <div id="invoice" className="bg-secondary rounded-2xl p-5 md:p-8 mt-4 ">
        <h1 className="text-center tracking-[0.2em] text-base md:text-xl text-gray-400 font-semibold">
          Invoice
        </h1>

        <div className="flex justify-between items-start mt-6">
          <Image
            src={logo}
            alt="Logo"
            width={200}
            height={150}
            className="h-auto w-[150px] md:w-[200px]"
          />

          <div className="text-right text-base space-y-2 text-gray-700">
            <p className="text-black font-semibold text-xl">Prepared For</p>
            <p>{invoice?.client?.clientName || "-"}</p>
            <p>{invoice?.client?.address || "-"}</p>
            <p>{invoice?.client?.phoneNumber || "-"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-base text-gray-700">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-black">
              Geo Paving and Sealcoating
            </h2>
            <p>{invoice?.client?.address || "-"}</p>
            <p>
              <span className="font-semibold text-black">Phone :</span>{" "}
              {invoice?.client?.phoneNumber || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Email :</span>{" "}
              {invoice?.client?.email || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Web :</span>{" "}
              www.geopaving.com
            </p>
          </div>

          <div className="space-y-2 md:justify-self-end text-left md:text-right">
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
              <span className="font-semibold text-black">Business / Tax #</span>
              <span className="inline-block w-6 text-center">:</span>
              {invoice?.client?.zip || "-"}
            </p>
          </div>
        </div>

        <div
          data-pdf-table-wrapper
          className="mt-8 border border-gray-500 overflow-x-auto"
        >
          <table
            data-pdf-table
            className="w-full min-w-[760px] border-collapse text-base text-gray-700"
          >
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-500 px-3 py-2 text-left font-semibold text-black w-[35%]">
                  SCOPE OF WORK
                </th>
                <th className="border border-gray-500 px-3 py-2 font-semibold text-black">
                  QTY
                </th>
                <th className="border border-gray-500 px-3 py-2 font-semibold text-black">
                  UNIT
                </th>
                <th className="border border-gray-500 px-3 py-2 font-semibold text-black">
                  UNIT COST
                </th>
                <th className="border border-gray-500 px-3 py-2 font-semibold text-black">
                  MARKUP
                </th>
                <th className="border border-gray-500 px-3 py-2 font-semibold text-black">
                  TAX
                </th>
                <th className="border border-gray-500 px-3 py-2 font-semibold text-black">
                  DISCOUNT
                </th>
                <th className="border border-gray-500 px-3 py-2 font-semibold text-black">
                  PRICE
                </th>
              </tr>
            </thead>

            <tbody>
              {normalizedItems.length > 0 ? (
                normalizedItems.map(
                  (
                    item: {
                      description?: string;
                      quantity?: number;
                      unit?: string;
                      markUp?:
                        | number
                        | { percentage?: number; amount?: number };
                      discount?: number;
                      amount?: number;
                      rate?: number;
                      subTotal?: number;
                      taxPercentage?: number;
                      tax?: { percentage?: number; amount?: number };
                    },
                    index: number,
                  ) => {
                    const qty = Number(item?.quantity || 1);
                    const amount = Number(
                      item?.rate ?? item?.amount ?? unitCost,
                    );
                    const markUp =
                      typeof item?.markUp === "object"
                        ? Number(
                            item?.markUp?.percentage ||
                              item?.markUp?.amount ||
                              0,
                          )
                        : Number(item?.markUp || 0);
                    const taxPercent =
                      Number(
                        item?.taxPercentage ?? item?.tax?.percentage ?? 0,
                      ) || 0;
                    const discount = Number(item?.discount || 0);
                    const rowPrice = Number(item?.subTotal ?? amount * qty);

                    return (
                      <>
                        <tr key={`desc-${index}`} className="bg-gray-200">
                          <td className="border border-gray-500 px-3 py-2 font-medium text-black">
                            {item?.description || "-"}
                          </td>
                          <td
                            className="border border-gray-500 px-3 py-2"
                            colSpan={6}
                          />
                        </tr>
                        <tr key={`item-${index}`}>
                          <td className="border border-gray-500 px-3 py-2 text-gray-600">
                            &nbsp;
                          </td>
                          <td className="border border-gray-500 px-3 py-2 text-center">
                            {qty}
                          </td>
                          <td className="border border-gray-500 px-3 py-2 text-center">
                            {item?.unit || "SF"}
                          </td>
                          <td className="border border-gray-500 px-3 py-2 text-center">
                            {formatCurrency(amount)}
                          </td>
                          <td className="border border-gray-500 px-3 py-2 text-center">
                            {markUp}%
                          </td>
                          <td className="border border-gray-500 px-3 py-2 text-center">
                            {taxPercent}%
                          </td>
                          <td className="border border-gray-500 px-3 py-2 text-center">
                            {discount}%
                          </td>
                          <td className="border border-gray-500 px-3 py-2 text-center font-medium ">
                            {formatCurrency(rowPrice)}
                          </td>
                        </tr>
                        <tr key={`sub-${index}`}>
                          <td
                            className="border border-gray-500 px-3 py-2  text-right font-semibold text-black"
                            colSpan={7}
                          >
                            Subtotal
                          </td>
                          <td className="border border-gray-500 px-3 py-2  font-semibold text-black text-center">
                            {formatCurrency(rowPrice)}
                          </td>
                        </tr>
                      </>
                    );
                  },
                )
              ) : (
                <tr>
                  <td className="border border-gray-500 px-3 py-3" colSpan={7}>
                    No items available.
                  </td>
                </tr>
              )}

              <tr>
                <td
                  className="border border-gray-500 px-3 py-3 text-center font-bold text-black"
                  colSpan={7}
                >
                  GRAND TOTAL
                </td>
                <td className="border border-gray-500 px-3 py-3 text-center font-bold text-black">
                  {formatCurrency(Number(invoice?.grandTotal || 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 text-base text-gray-700 space-y-2">
          <p className="font-normal text-black text-xl">
            Terms and conditions:
          </p>
          <p>
            1) All deliveries of material, supplies, or equipment over roadways
            of the drives of the premises shall not incur liability to company.
          </p>
          <p>
            2) Geo paving and Sealcoating shall not be responsible for the
            following:
          </p>
          <p>
            3) Geo paving and Sealcoating will warrantee materials and
            workmanship for 1 year
          </p>
          <p>
            4) Any invoice not paid upon completion will be subject to interest
            of 5% per month. An invoice is considered paid when Geo paving and
            Sealcoating has payment in their possession.
          </p>
        </div>

        <div className="md:hidden mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={handleSendEstimateEmail}
            disabled={isSendingReminder}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-60"
          >
            <AiOutlineMail />
            Email
          </button>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3 text-primary transition-colors hover:bg-primary hover:text-white"
          >
            <Image
              src={paymentIcon}
              alt="Payment"
              width={18}
              height={18}
              className="transition duration-300 group-hover:brightness-0 group-hover:invert"
            />
            Payment
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-white transition-colors hover:opacity-90"
          >
            <FiDownload />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
