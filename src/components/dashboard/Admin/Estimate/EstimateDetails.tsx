"use client";

import stars from "@/assets/dashboard/stars.png";
import logo from "@/assets/kal-logo.png";
import Conditions from "@/components/Conditions";
import {
  useGetEstimateByIdQuery,
  useSendEstimateMailMutation,
  useUpdateEstimateStatusMutation,
} from "@/redux/api/admin/estimateApi";
import { useGenerateFromEstimateMutation } from "@/redux/api/admin/invoiceApi";
import html2pdf from "html2pdf.js";
import { Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";

type ItemFormat = "TABLE" | "DESCRIPTION" | "IMAGE_PDF";

export default function EstimateDetails() {
  const { id } = useParams();

  const { data, isLoading, error } = useGetEstimateByIdQuery(id as string);
  const estimate = data?.result;

  const [sendEstimateMail, { isLoading: isSendingMail }] =
    useSendEstimateMailMutation();
  const [updateEstimateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateEstimateStatusMutation();
  const [generateFromEstimate, { isLoading: isGeneratingInvoice }] =
    useGenerateFromEstimateMutation();

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [showClientEmail, setShowClientEmail] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    to: string[];
    subject: string;
    message: string;
    sendMeCopy: boolean;
  }>({
    to: [],
    subject: "",
    message:
      "We are following up to confirm whether you have had an opportunity to review the estimate that was previously sent.",
    sendMeCopy: true,
  });

  useEffect(() => {
    const clientEmail = estimate?.client?.email;
    if (!clientEmail || showClientEmail) return;
    setFormData((prev) => ({ ...prev, to: [clientEmail, ...prev.to] }));
    setShowClientEmail(true);
  }, [estimate, showClientEmail]);

  const addRecipientEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const emails = trimmed
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const valid = emails.filter((email) => /\S+@\S+\.\S+/.test(email));
    if (valid.length > 0) {
      setFormData((prev) => ({ ...prev, to: [...prev.to, ...valid] }));
      setEmailInput("");
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const normalizedItems = Array.isArray(estimate?.items) ? estimate.items : [];
  const sideMapUrls = Array.isArray(estimate?.sideMap)
    ? estimate.sideMap
    : estimate?.sideMap
      ? [estimate.sideMap]
      : [];
  const fileUrls = Array.isArray(estimate?.fileUrls) ? estimate.fileUrls : [];

  const normalizeItemFormat = (value: any): ItemFormat => {
    const format = String(value || "").toUpperCase();
    if (format === "TABLE") return "TABLE";
    if (format === "IMAGE_PDF") return "IMAGE_PDF";
    return "DESCRIPTION";
  };

  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

  const getItemsByFormat = (format: ItemFormat) =>
    normalizedItems.filter(
      (item: any) => normalizeItemFormat(item?.format) === format,
    );

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
      filename: `${estimate?.estimateName || "estimate"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
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

  const handleSendEstimateEmail = async () => {
    if (!id) return;

    const to = formData.to.map((email) => email.trim()).filter(Boolean);

    if (to.length === 0) {
      toast.error("Please add at least one recipient email.");
      return;
    }

    try {
      await sendEstimateMail({
        estimateId: id as string,
        to,
        cc: [],
        bcc: [],
        message: formData.message,
        sendMeCopy: formData.sendMeCopy,
        subject: formData.subject,
      }).unwrap();

      setIsReminderOpen(false);
      setEmailInput("");
      setFormData((prev) => ({ ...prev, to: [] }));
      toast.success("Estimate email sent successfully.");
    } catch {
      toast.error("Failed to send estimate email. Please try again.");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!editEstimateId) return;
    const capitalized =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    setSelectedStatus(capitalized);
    try {
      await updateEstimateStatus({
        id: editEstimateId,
        status: capitalized,
      }).unwrap();
      setIsStatusOpen(false);
    } catch {
      setSelectedStatus(null);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!editEstimateId) return;
    try {
      await generateFromEstimate({ estimateId: editEstimateId }).unwrap();
      toast.success("Invoice generated successfully");
    } catch {
      toast.error("Failed to generate invoice");
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

  if (error || !estimate) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/estimate"
          className="flex items-center gap-2 hover:underline"
        >
          <FiArrowLeft />
          Back To Estimate List Page
        </Link>
        <p className="text-red-500">Failed to load estimate details.</p>
      </div>
    );
  }

  const editEstimateId =
    typeof id === "string"
      ? id
      : Array.isArray(id)
        ? id[0]
        : estimate?.id || "";

  const subtotal = normalizedItems.reduce((sum: number, item: any) => {
    const qty = Number(item?.quantity || 0);
    const rate = Number(item?.rate ?? item?.amount ?? 0);
    const price = item?.subTotal != null ? Number(item.subTotal) : rate * qty;
    return sum + price;
  }, 0);

  const renderTableSection = () => {
    const items = getItemsByFormat("TABLE");
    if (!items.length) return null;

    return (
      <div className="space-y-3" key="TABLE">
        <div className="flex items-center justify-between border-b border-[#cfcfcf] pb-2 text-xl font-semibold text-black">
          <h2>Table Format</h2>
          <p>Total</p>
        </div>

        <div
          data-pdf-table-wrapper
          className="border border-gray-500 overflow-x-auto"
        >
          <table
            data-pdf-table
            className="w-full min-w-[760px] border-collapse text-xs md:text-sm text-gray-700"
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
              {items.map((item: any, index: number) => {
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
                      markUpDisplay = formatCurrency(rawMarkUp.amount);
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
                  <Fragment key={`table-row-${index}`}>
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
                      <td className="border border-gray-500 px-3 py-2 font-semibold text-black text-center">
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
    const items = getItemsByFormat("DESCRIPTION");
    if (!items.length) return null;

    return (
      <div className="space-y-3" key="DESCRIPTION">
        <div className="flex justify-between border-b border-[#cfcfcf] pb-2 text-xl font-semibold text-black">
          <h2>Description</h2>
          <p>Total</p>
        </div>

        {items.map((item: any, index: number) => {
          const qty = Number(item?.quantity || 0);
          const rate = Number(item?.rate ?? item?.amount ?? 0);
          const price =
            item?.subTotal != null ? Number(item.subTotal) : rate * qty;

          return (
            <div
              key={item?.id || index}
              className="flex flex-col md:flex-row md:justify-between gap-4 border-b border-[#e1e1e1] py-3 text-base leading-5 text-gray-700"
            >
              <div className="space-y-2 w-full md:w-3/5">
                <p className="font-semibold text-black">
                  {item?.itemName || "Item"}
                </p>
                {item?.description && (
                  <p className="text-base text-gray-600">{item.description}</p>
                )}
              </div>

              <div className="w-full md:w-1/5 flex items-center justify-end">
                <div className="text-right">
                  <div className="font-semibold text-black">
                    $ {price.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-9 space-y-4">
          <div>
            {sideMapUrls.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 mt-4">
                {sideMapUrls.map((url: string, index: number) => (
                  <div
                    key={`side-map-${index}`}
                    className="border-2 border-orange-200 bg-white p-2"
                  >
                    {isVideoUrl(url) ? (
                      <video controls className="w-full h-auto rounded-sm">
                        <source src={url} />
                      </video>
                    ) : (
                      <Image
                        src={url}
                        alt={`Side Map ${index + 1}`}
                        width={900}
                        height={520}
                        className="w-full md:h-[700px] object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4 h-[200px] md:h-[350px] flex items-center justify-center bg-[#f9f9f9] border-2 border-orange-200">
                No side maps available
              </p>
            )}

            <div className="border-2 border-t-0 border-orange-200 bg-[#f9f9f9]">
              <div className="grid grid-cols-1 text-base text-gray-700 md:grid-cols-3">
                <div className="border-b border-[#e1e1e1] p-3 text-lg font-normal space-y-3 md:border-b-0 md:border-r-2 md:border-orange-200">
                  <Image
                    src={logo}
                    alt="Logo"
                    width={100}
                    height={52}
                    className="mb-2 h-28 w-[76px] md:w-[200px]"
                  />
                  <p>Cucamonga, CA 91730</p>
                  <p>Costa Mesa, CA 92626</p>
                  <p>Phone: (951) 463-7002</p>
                  <p>Email: kal@geopaving.com</p>
                  <p>Web: www.geopaving.com</p>
                </div>
                <div className="p-3 text-lg font-normal space-y-2 md:border-b-0 md:border-r-2 md:border-orange-200">
                  <p>Name: {estimate?.client?.clientName || "-"}</p>
                  <p>{estimate?.client?.address || "-"}</p>
                  <p>{estimate?.client?.city || "-"}</p>
                </div>
                <div className="p-3 font-normal text-lg border-t-2 border-orange-200 md:border-t-0">
                  <p>{estimate?.legendary}</p>
                </div>
              </div>
            </div>
          </div>

          {fileUrls.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {fileUrls.map((url: string, index: number) => (
                <div key={`file-${index}`} className="border-2  bg-white p-2">
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
            <p className="text-center text-gray-500 mt-4 h-[200px] md:h-[350px] flex items-center justify-center bg-[#f9f9f9] border-2 ">
              No files available
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderImagePdfSection = () => {
    const items = getItemsByFormat("IMAGE_PDF");
    if (!items.length) return null;

    return (
      <div className="space-y-3" key="IMAGE_PDF">
        <div className="flex justify-between border-b border-[#cfcfcf] pb-2 text-xl font-semibold text-black">
          <h2>Image PDF</h2>
          <p>Total</p>
        </div>

        {items.map((item: any, index: number) => {
          const qty = Number(item?.quantity || 0);
          const rate = Number(item?.rate ?? item?.amount ?? 0);
          const price =
            item?.subTotal != null ? Number(item.subTotal) : rate * qty;
          const imageUrls = Array.isArray(item?.imageUrls)
            ? item.imageUrls
            : [];

          return (
            <div
              key={item?.id || index}
              className="border-b border-[#e1e1e1] py-4 space-y-3 text-base text-gray-700"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="space-y-2 w-full md:w-3/5">
                  <p className="font-semibold text-black">
                    {item?.itemName || "Item"}
                  </p>
                  {item?.description && (
                    <p className="text-base text-gray-600">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="w-full md:w-1/5 flex items-center justify-end">
                  <div className="text-right">
                    <div className="font-semibold text-black">
                      $ {price.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imageUrls.map((imageUrl: string, imageIndex: number) => (
                    <Image
                      key={`${item?.id || index}-${imageIndex}`}
                      src={imageUrl}
                      alt={`Item image ${imageIndex + 1}`}
                      width={180}
                      height={140}
                      className="w-full h-28 md:h-32 object-cover rounded-lg bg-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <Link
        href="/admin/estimate"
        className="flex items-center gap-2 hover:underline text-gray-500 mt-6"
      >
        <FiArrowLeft />
        Back To Estimate List Page
      </Link>

      <div className="md:flex flex-col md:flex-row md:justify-between mt-7 hidden">
        <div className="flex items-center gap-3 mt-4">
          <Link
            href={
              editEstimateId
                ? `/admin/edit-estimate?id=${editEstimateId}`
                : "/admin/estimate"
            }
            onClick={() => {
              if (typeof window !== "undefined" && editEstimateId) {
                localStorage.setItem("editingEstimateId", editEstimateId);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <Edit size={16} />
            Edit
          </Link>

          <button
            onClick={() => setIsReminderOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <AiOutlineMail />
            Email
          </button>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="relative inline-block">
            <button
              onClick={() => setIsStatusOpen((s) => !s)}
              className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg bg-white hover:bg-primary hover:text-white duration-200 ease-in"
            >
              <span className="capitalize font-medium">
                {selectedStatus ?? estimate?.status ?? "pending"}
              </span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isStatusOpen && (
              <div className="absolute right-0 mt-2 w-44 rounded-lg bg-white shadow-md p-2 z-50 border border-gray-100">
                <button
                  onClick={() => handleUpdateStatus("pending")}
                  disabled={isUpdatingStatus}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#fff4ec] text-base text-gray-700"
                >
                  Pending
                </button>
                <button
                  onClick={() => handleUpdateStatus("declined")}
                  disabled={isUpdatingStatus}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#fff4ec] text-base text-gray-700"
                >
                  Declined
                </button>
                <button
                  onClick={() => handleUpdateStatus("approved")}
                  disabled={isUpdatingStatus}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#fff4ec] text-base text-gray-700"
                >
                  Approved
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateInvoice}
            disabled={isGeneratingInvoice}
            className="group flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg bg-white hover:bg-primary hover:text-white duration-200 ease-in disabled:opacity-60"
          >
            <Image
              src={stars}
              alt="Generate"
              width={16}
              height={16}
              className="h-4 w-4 group-hover:invert group-hover:brightness-200"
            />
            <span>
              {isGeneratingInvoice ? "Generating..." : "Generate Invoice"}
            </span>
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

      <div id="invoice" className="bg-secondary rounded-2xl p-5 md:p-8 mt-4">
        <h1 className="text-center tracking-[0.2em] text-base md:text-xl text-gray-400 font-semibold">
          ESTIMATE
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
            <p className="text-black font-semibold text-base">Prepared For</p>
            <p>{estimate?.client?.clientName || "-"}</p>
            <p>{estimate?.client?.address || "-"}</p>
            <p>{estimate?.client?.phoneNumber || "-"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 text-base text-gray-700">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-black">
              Geo Paving and Sealcoating
            </h2>
            <p>{estimate?.client?.address || "-"}</p>
            <p>
              <span className="font-semibold text-black">Phone :</span>{" "}
              {estimate?.client?.phoneNumber || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Email :</span>{" "}
              {estimate?.client?.email || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Web :</span>{" "}
              www.geopaving.com
            </p>
          </div>

          <div className="space-y-2 md:justify-self-end text-left md:text-right">
            <p>
              <span className="font-semibold text-black">Estimate</span>
              <span className="inline-block w-6 text-center">:</span>#{" "}
              {estimate?.id?.slice(-4) || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Date</span>
              <span className="inline-block w-6 text-center">:</span>
              {estimate?.date || "-"}
            </p>
            <p>
              <span className="font-semibold text-black">Business / Tax #</span>
              <span className="inline-block w-6 text-center">:</span>
              {estimate?.client?.zip || "-"}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-10">
          {renderTableSection()}
          {renderDescriptionSection()}
          {renderImagePdfSection()}

          {normalizedItems.length === 0 && (
            <div className="flex justify-between border-b border-[#e1e1e1] py-3 text-[10px] text-gray-700">
              <p>No items</p>
              <p>$0.00</p>
            </div>
          )}

          <div className="flex justify-end">
            <div className="w-full max-w-[250px] space-y-2 text-base">
              <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                <p className="font-semibold">Subtotal</p>
                <p className="font-semibold">${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                <p className="font-semibold">Total</p>
                <p className="font-semibold">
                  ${(Number(estimate?.grandTotal) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <Conditions className="mt-8" />
      </div>

      {isReminderOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsReminderOpen(false)}
        >
          <div
            className="w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Send Estimate
            </h2>

            <div className="mt-8 space-y-6">
              <div className="space-y-3">
                <label className="block text-base font-medium text-gray-900">
                  To
                </label>

                <div className="flex min-h-[48px] w-full flex-wrap items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-primary">
                  {showClientEmail && estimate?.client?.email ? (
                    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-base text-gray-700">
                      <span>{estimate.client.email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowClientEmail(false);
                          setFormData((prev) => ({
                            ...prev,
                            to: prev.to.filter(
                              (email) => email !== estimate.client.email,
                            ),
                          }));
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Remove client email"
                      >
                        x
                      </button>
                    </div>
                  ) : null}

                  {formData.to.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-base text-gray-700"
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
                        x
                      </button>
                    </div>
                  ))}

                  <input
                    type="text"
                    placeholder="Add email..."
                    value={emailInput}
                    onChange={(event) => setEmailInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addRecipientEmail(emailInput);
                      }
                    }}
                    className="flex-1 bg-transparent text-base outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-base font-medium text-gray-900">
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
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-base text-gray-500 outline-none placeholder:text-gray-400 focus:border-primary"
                />
              </div>

              <div className="space-y-3">
                <label className="block text-base font-medium text-gray-900">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={formData.message}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base text-gray-700 outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-4 py-3">
                <span className="text-base font-medium text-gray-700">
                  Send me a copy
                </span>
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
                >
                  <span
                    className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      formData.sendMeCopy ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReminderOpen(false)}
                  className="rounded-xl border border-gray-200 px-5 py-2 text-base text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendEstimateEmail}
                  className="rounded-xl bg-primary px-5 py-2 text-base text-white hover:opacity-90"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between mt-7 md:hidden">
        <div className="flex items-center gap-3 mt-4">
          <Link
            href={
              editEstimateId
                ? `/admin/edit-estimate?id=${editEstimateId}&format=table`
                : "/admin/estimate"
            }
            onClick={() => {
              if (typeof window !== "undefined" && editEstimateId) {
                localStorage.setItem("editingEstimateId", editEstimateId);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <Edit size={16} />
            Edit
          </Link>

          <button
            onClick={() => setIsReminderOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <AiOutlineMail />
            Email
          </button>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleGenerateInvoice}
            disabled={isGeneratingInvoice}
            className="group flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg bg-white hover:bg-primary hover:text-white duration-200 ease-in disabled:opacity-60"
          >
            <Image
              src={stars}
              alt="Generate"
              width={16}
              height={16}
              className="h-4 w-4 group-hover:invert group-hover:brightness-200"
            />
            <span>
              {isGeneratingInvoice ? "Generating..." : "Generate Invoice"}
            </span>
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
  );
}
