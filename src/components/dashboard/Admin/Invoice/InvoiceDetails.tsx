"use client";

import paymentIcon from "@/assets/dashboard/credit-card-validation.png";
import logo from "@/assets/kal-logo.png";
import Conditions from "@/components/Conditions";
import {
  useGetInvoiceByIdQuery,
  useSendInvoiceMailMutation,
  useUpdateEmailStatusMutation,
} from "@/redux/api/admin/invoiceApi";
import html2pdf from "html2pdf.js";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";

import PaymentModal from "./Payment/PaymentModal";

type ItemFormat = "TABLE" | "DESCRIPTION" | "IMAGE_PDF";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function normalizeItemFormat(value: any): ItemFormat {
  const normalized = String(value || "").toUpperCase();
  if (normalized === "TABLE") return "TABLE";
  if (normalized === "IMAGE_PDF") return "IMAGE_PDF";
  return "DESCRIPTION";
}

export default function InvoiceDetails({ format }: { format?: string }) {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const formatParam = searchParams?.get("format") || format;

  const { data, isLoading, error, refetch } = useGetInvoiceByIdQuery(
    id as string,
  );
  const invoice = (data as any)?.result;
  const editInvoiceId =
    typeof id === "string" ? id : Array.isArray(id) ? id[0] : invoice?.id || "";
  const clientEmail = invoice?.client?.email || "";

  const [updateEmailStatus] = useUpdateEmailStatusMutation();

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

  useEffect(() => {
    const shouldMarkRead =
      formatParam === "description" || formatParam === "table";

    if (!id || !invoice || !shouldMarkRead) return;
    if (emailMarkedRead) return;

    (async () => {
      try {
        await updateEmailStatus({
          invoiceId: id as string,
          payload: { emailStatus: "READ" },
        }).unwrap();

        setEmailMarkedRead(true);
        refetch();
      } catch {
        // ignore background email state failures
      }
    })();
  }, [id, invoice, formatParam, emailMarkedRead, refetch, updateEmailStatus]);

  useEffect(() => {
    if (!invoice || showClientEmail) return;
    const cEmail = invoice?.client?.email;
    if (cEmail) {
      setFormData((prev) => ({ ...prev, to: [cEmail, ...prev.to] }));
      setShowClientEmail(true);
    }
  }, [invoice, showClientEmail]);

  const normalizedItems = Array.isArray(invoice?.items) ? invoice.items : [];
  const sideMapUrls = Array.isArray(invoice?.sideMap)
    ? invoice.sideMap
    : invoice?.sideMap
      ? [invoice.sideMap]
      : [];
  const fileUrls = Array.isArray(invoice?.fileUrls) ? invoice.fileUrls : [];

  const itemsByFormat = (itemFormat: ItemFormat) =>
    normalizedItems.filter(
      (item: any) => normalizeItemFormat(item?.format) === itemFormat,
    );

  const subtotal = normalizedItems.reduce((sum: number, item: any) => {
    return sum + (Number(item?.subTotal) || 0);
  }, 0);

  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

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

    if (tableWrapper) tableWrapper.style.overflowX = "visible";
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
        if (tableWrapper) tableWrapper.style.overflowX = wrapperOverflow || "";
        if (tableElement) {
          tableElement.style.minWidth = tableMinWidth || "";
          tableElement.style.width = tableWidth || "";
          tableElement.style.tableLayout = tableLayout || "";
        }
        element.style.padding = elementPadding || "";
        element.style.borderRadius = elementBorderRadius || "";
      });
  };

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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
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

  const invoiceItemsByTable = itemsByFormat("TABLE");
  const invoiceItemsByDescription = itemsByFormat("DESCRIPTION");
  const renderedItems =
    formatParam === "table" ? invoiceItemsByTable : invoiceItemsByDescription;

  const renderTableSection = () => {
    if (!invoiceItemsByTable.length) return null;

    return (
      <div className="space-y-3" key="TABLE">
        <div className=" text-xl font-semibold text-black">
          <h2>Table </h2>
        </div>

        <div
          data-pdf-table-wrapper
          className="overflow-x-auto rounded-lg border border-gray-500"
        >
          <table
            data-pdf-table
            className="w-full min-w-[760px] border-collapse text-xs text-gray-700 md:text-sm"
          >
            <thead>
              <tr className="bg-gray-100">
                <th className="w-[35%] border border-gray-500 px-3 py-2 text-left font-semibold text-black">
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
              {invoiceItemsByTable.map((item: any, index: number) => {
                const qty = Number(item?.quantity || 1);
                const unit = item?.unit || "SF";
                const unitCostVal = Number(item?.rate ?? item?.amount ?? 0);

                const rawMarkUp = item?.markUp;
                let markUpDisplay = "0%";
                if (rawMarkUp != null) {
                  if (typeof rawMarkUp === "object") {
                    if (rawMarkUp.percentage != null) {
                      markUpDisplay = `${rawMarkUp.percentage}%`;
                    } else if (rawMarkUp.amount != null) {
                      markUpDisplay = formatCurrency(Number(rawMarkUp.amount));
                    }
                  } else {
                    markUpDisplay = `${Number(rawMarkUp) || 0}%`;
                  }
                }

                const rawTax =
                  item?.tax ??
                  item?.taxPercentage ??
                  item?.item?.taxPercentage ??
                  item?.tax?.percentage ??
                  0;

                const taxDisplay =
                  typeof rawTax === "object"
                    ? rawTax?.percentage != null
                      ? `${rawTax.percentage}%`
                      : "0%"
                    : `${Number(rawTax) || 0}%`;

                const discountVal = Number(item?.discount ?? 0);
                const rowPrice = Number(item?.subTotal ?? unitCostVal * qty);

                return (
                  <Fragment key={`invoice-table-row-${index}`}>
                    <tr className="bg-gray-200">
                      <td className="border border-gray-500 px-3 py-2 font-medium text-black">
                        {item?.description || "-"}
                      </td>
                      <td
                        className="border border-gray-500 px-3 py-2"
                        colSpan={7}
                      />
                    </tr>

                    <tr>
                      <td className="border border-gray-500 px-3 py-2 text-gray-600">
                        &nbsp;
                      </td>
                      <td className="border border-gray-500 px-3 py-2 text-center">
                        {qty}
                      </td>
                      <td className="border border-gray-500 px-3 py-2 text-center">
                        {unit}
                      </td>
                      <td className="border border-gray-500 px-3 py-2 text-center">
                        {formatCurrency(unitCostVal)}
                      </td>
                      <td className="border border-gray-500 px-3 py-2 text-center">
                        {markUpDisplay}
                      </td>
                      <td className="border border-gray-500 px-3 py-2 text-center">
                        {taxDisplay}
                      </td>
                      <td className="border border-gray-500 px-3 py-2 text-center">
                        {discountVal}%
                      </td>
                      <td className="border border-gray-500 px-3 py-2 text-center font-medium">
                        {formatCurrency(rowPrice)}
                      </td>
                    </tr>

                    <tr>
                      <td
                        className="border border-gray-500 px-3 py-2 text-right font-semibold text-black"
                        colSpan={7}
                      >
                        Subtotal
                      </td>
                      <td className="border border-gray-500 px-3 py-2 text-center font-semibold text-black">
                        {formatCurrency(rowPrice)}
                      </td>
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDescriptionSection = () => {
    if (!renderedItems.length) return null;

    return (
      <div className="space-y-3" key="DESCRIPTION">
        <div className="flex justify-between border-b border-[#cfcfcf] pb-2 text-xl font-semibold text-black">
          <h2>Description</h2>
          <p>Total</p>
        </div>

        {renderedItems.map((item: any, index: number) => {
          const qty = Number(item?.quantity || 0);
          const rate = Number(item?.rate ?? item?.amount ?? 0);
          const price =
            item?.subTotal != null ? Number(item.subTotal) : rate * qty;

          return (
            <div
              key={item?.id || index}
              className="flex flex-col gap-4 border-b border-[#e1e1e1] py-3 text-base leading-5 text-gray-700 md:flex-row md:justify-between"
            >
              <div className="w-full space-y-2 md:w-3/5">
                <p className="font-semibold text-black">
                  {item?.itemName || "Item"}
                </p>
                {item?.description && (
                  <p className="text-base text-gray-600">{item.description}</p>
                )}
              </div>

              <div className="flex w-full items-center justify-end md:w-1/5">
                <div className="text-right font-semibold text-black">
                  {formatCurrency(price)}
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end ">
          <div className="">
            <div className="flex justify-between gap-4 border-b border-[#e1e1e1] py-3">
              <p className="font-semibold text-black">Subtotal</p>
              <p className="font-semibold text-black">
                {formatCurrency(subtotal)}
              </p>
            </div>
            <div className="flex justify-between gap-4 border-b border-[#e1e1e1] py-3">
              <p className="font-semibold text-black">Grand Total</p>
              <p className="font-semibold text-black">
                {formatCurrency(Number(invoice?.grandTotal) || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSupportingMedia = () => (
    <div className="mt-9 space-y-4  pt-6">
      <div>
        {sideMapUrls.length > 0 ? (
          <div className="grid grid-cols-1">
            {sideMapUrls.map((url: string, index: number) => (
              <div
                key={`side-map-${index}`}
                className="border-2 border-orange-200 bg-white"
              >
                {isVideoUrl(url) ? (
                  <video controls className="h-auto w-full rounded-base">
                    <source src={url} />
                  </video>
                ) : (
                  <Image
                    src={url}
                    alt={`Side Map ${index + 1}`}
                    width={900}
                    height={520}
                    className="h-auto w-full object-contain md:h-[700px]"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 flex h-[200px] items-center justify-center border-2 border-orange-200 bg-[#f9f9f9] text-center text-gray-500 md:h-[350px]">
            No side maps available
          </p>
        )}

        <div className="border-2 border-t-0 border-orange-200 bg-[#f9f9f9]">
          <div className="grid grid-cols-1 text-base text-gray-700 md:grid-cols-3">
            <div className="space-y-3 border-b border-[#e1e1e1] p-3 text-lg font-normal md:border-b-0 md:border-r-2 md:border-orange-200">
              <Image
                src={logo}
                alt="Logo"
                width={100}
                height={52}
                className="mb-2 h-28 w-[76px] md:w-[200px]"
              />
              <p>9530 Juniper Crest Ct, Ste 1012 Rancho</p>
              <p>Cucamonga, CA 91730</p>
              <p>Phone: (626) 447-0525</p>
              <p>Email: info@geopaving.com</p>
              <p>Web: www.geopaving.com</p>
            </div>

            <div className="space-y-2 border-b border-[#e1e1e1] p-3 text-lg font-normal md:border-b-0 md:border-r-2 md:border-orange-200">
              <p>Name: {invoice?.client?.clientName || "-"}</p>
              <p>{invoice?.client?.address || "-"}</p>
              <p>{invoice?.client?.city || "-"}</p>
              <p>{invoice?.client?.state || "-"}</p>
              <p>{invoice?.client?.zip || "-"}</p>
            </div>

            <div className="border-t-2 border-orange-200 p-3 text-lg font-normal md:border-t-0">
              <p>{invoice?.legendary || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {fileUrls.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {fileUrls.map((url: string, index: number) => (
            <div key={`file-${index}`} className="border-2  bg-white p-2">
              {isVideoUrl(url) ? (
                <video controls className="h-auto w-full rounded-sm">
                  <source src={url} />
                </video>
              ) : (
                <Image
                  src={url}
                  alt={`Attachment ${index + 1}`}
                  width={900}
                  height={520}
                  className="h-auto w-full object-contain md:h-[700px]"
                />
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <div className="mx-auto mt-4 px-4 py-10 w-full">
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

        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <div className="">
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
              (invoice?.emailStatus || "").toString().toUpperCase() ===
                "READ") && (
              <div className="mt-3 text-center text-sm text-green-700 bg-green-50 rounded-md py-2 px-3">
                ✓ Email opened
              </div>
            )}

            <div
              id="invoice"
              className="mt-4 rounded-2xl bg-secondary p-4 py-9 md:p-6"
            >
              <h1 className="text-center text-xl font-semibold uppercase tracking-[0.16em] text-gray-400">
                Invoice
              </h1>

              <div className="mt-5 flex items-start justify-between">
                <Image
                  src={logo}
                  alt="Logo"
                  width={150}
                  height={80}
                  className="h-auto w-[150px] md:w-[200px]"
                />

                <div className="space-y-3 text-right text-base leading-5 text-gray-700">
                  <p className="text-xl font-semibold text-black">
                    Prepared For
                  </p>
                  <p>{invoice?.client?.clientName || "-"}</p>
                  <p>{invoice?.client?.address || "-"}</p>
                  <p>{invoice?.client?.city || "-"}</p>
                  <p>{invoice?.client?.zip || "-"}</p>
                  <p>{invoice?.client?.phoneNumber || "-"}</p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-6 text-[10px] leading-5 text-gray-700 md:grid-cols-2">
                <div className="space-y-3 text-base">
                  <h2 className="text-xl font-semibold text-black">
                    Geo Paving and Sealcoating
                  </h2>
                  <p>9530 Juniper Crest Ct, Ste 1012 Rancho</p>
                  <p>Cucamonga, CA 91730</p>
                  <p>Phone: (626) 447-0525</p>
                  <p>
                    Email:{" "}
                    <span className="text-black">info@geopaving.com</span>
                  </p>
                  <p>
                    Web: <span className="text-black">www.geopaving.com</span>
                  </p>
                </div>

                <div className="space-y-3 text-left text-base md:justify-self-end md:text-right">
                  <p>
                    <span className="font-semibold text-black">Invoice</span>
                    <span className="inline-block w-6 text-center">:</span>#
                    {invoice?.invoiceNumber || invoice?.id?.slice(-4) || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-black">Date</span>
                    <span className="inline-block w-6 text-center">:</span>
                    {invoice?.date || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-black">End Date</span>
                    <span className="inline-block w-6 text-center">:</span>
                    {invoice?.endDate || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-black">Status</span>
                    <span className="inline-block w-6 text-center">:</span>
                    {invoice?.status || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-black">
                      Business / Tax #
                    </span>
                    <span className="inline-block w-6 text-center">:</span>
                    {invoice?.client?.zip || "-"}
                  </p>
                </div>
              </div>

              {invoice?.noteForClient ? (
                <div className="mt-8 rounded-xl border border-[#d8d8d8] bg-white/70 p-4">
                  <h2 className="mb-2 text-lg font-semibold text-black">
                    Note For Client
                  </h2>
                  <p className="text-base leading-6 text-gray-700">
                    {invoice.noteForClient}
                  </p>
                </div>
              ) : null}

              <div className="mt-8 space-y-8">
                {renderTableSection()}
                {renderDescriptionSection()}
              </div>

              {renderSupportingMedia()}

              <div className="mt-10 space-y-3 border-t pt-8">
                <Conditions className="mt-2" />
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
            </div>
          </div>
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

      {(emailMarkedRead ||
        (invoice?.emailStatus || "").toString().toUpperCase() === "READ") && (
        <div className="mx-auto mt-3 max-w-6xl rounded-md bg-green-50 px-3 py-2 text-center text-sm text-green-700">
          Email opened
        </div>
      )}
    </>
  );
}
