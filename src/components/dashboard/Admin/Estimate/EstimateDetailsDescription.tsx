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
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";

export default function EstimateDetailsDescription() {
  const { id } = useParams();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useGetEstimateByIdQuery(
    id as string,
  );
  const estimate = data?.result;

  const [sendEstimateMail, { isLoading: isSendingMail }] =
    useSendEstimateMailMutation();

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [showClientEmail, setShowClientEmail] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const [updateEstimateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateEstimateStatusMutation();

  const [generateFromEstimate, { isLoading: isGeneratingInvoice }] =
    useGenerateFromEstimateMutation();

  const [formData, setFormData] = useState<{
    to: string[];
    subject: string;
    message: string;
    sendMeCopy: boolean;
  }>({
    to: [],
    subject: "",
    message: `We are following up to confirm whether you have had an opportunity to review the invoice that
was previously sent.`,
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

  const handleDownload = () => {
    const element = document.getElementById("invoice");
    if (!element) return;

    const opt = {
      margin: 0.5,
      filename: `${estimate?.estimateName || "estimate"}.pdf`,
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

  const sideMapUrls = Array.isArray(estimate?.sideMap)
    ? estimate.sideMap
    : estimate?.sideMap
      ? [estimate.sideMap]
      : [];

  const fileUrls = Array.isArray(estimate?.fileUrls) ? estimate.fileUrls : [];
  const estimateItems = Array.isArray(estimate?.items) ? estimate.items : [];

  const subtotal = estimateItems.reduce((sum: number, item: any) => {
    return sum + (Number(item?.subTotal) || 0);
  }, 0);

  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

  const handleSendEstimateEmail = async () => {
    if (!id) return;

    const to = formData.to.map((email) => email.trim()).filter(Boolean);

    if (to.length === 0) {
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
    } catch {
      // keep modal open on failure so user can retry
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!editEstimateId) return;
    const capitalized =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    // optimistic UI
    setSelectedStatus(capitalized);
    try {
      await updateEstimateStatus({
        id: editEstimateId,
        status: capitalized,
      }).unwrap();
      setIsStatusOpen(false);
      try {
        refetch();
      } catch {}
    } catch (e) {
      // revert on failure
      setSelectedStatus(null);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!editEstimateId) return;

    try {
      await generateFromEstimate({ estimateId: editEstimateId }).unwrap();
      toast.success("Invoice generated successfully");
    } catch (error) {
      // keep the user on the page if generation fails
    }
  };

  return (
    <div className="pb-10 mt-4">
      <div className="flex items-center justify-between w-full px-4 md:px-0">
        <Link
          href="/admin/estimate"
          className="flex items-center gap-2 hover:underline text-gray-500"
        >
          <FiArrowLeft size={25} />
          <span className="hidden md:block">Back To Estimate List Page</span>
        </Link>
        <h1 className="text-xl font-bold text-gray-600 flex-1 text-center md:hidden">
          Estimate Details
        </h1>
        <div className="w-[120px]"></div> {/* balance right side */}
      </div>

      <div className="hidden md:flex md:flex-row justify-between">
        <div className="flex items-center  gap-3 mt-4">
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

        <div className="mt-3 flex gap-4">
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
              className="h-4 w-4 group-hover:invert-1 group-hover:brightness-200 duration-300"
            />
            <span>Generate Invoice</span>
          </button>
          <button
            onClick={handleDownload}
            className="bg-primary hover:opacity-90 text-white px-4 py-2 ease-in rounded-lg"
          >
            Download{" "}
          </button>
        </div>
      </div>

      <div
        id="invoice"
        className="mt-4  bg-secondary  rounded-2xl p-4 md:p-6 py-9"
      >
        <h1 className="text-center font-semibold tracking-[0.16em] text-xl text-gray-400 uppercase">
          Estimate
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
            <p className=" font-semibold text-black text-xl">Prepared For</p>
            <p>{estimate?.client?.clientName || "-"}</p>
            <p>{estimate?.client?.address || "-"}</p>
            <p>{estimate?.client?.city || "-"}</p>
            <p>{estimate?.client?.zip || "-"}</p>
            <p>{estimate?.client?.phoneNumber || "-"}</p>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px] leading-5 text-gray-700">
          <div className="space-y-3 text-base">
            <h2 className="text-xl font-semibold text-black">
              Geo Paving and Sealcoating
            </h2>
            <p>9650 Business Ctr. Dr. Ste.122 Rancho </p>
            <p>Cuc. CA91730, 185 Paularino Ave # D,</p>
            <p>Costa Mesa, CA 92626</p>
            <p className="font-semibold">
              Phone: <span className="font-normal">(951) 463-7002</span>
            </p>
            <p className="font-semibold">
              Email: <span className="font-normal">kal@geopaving.com</span>
            </p>
            <p className="font-semibold">
              Web: <span className="font-normal">www.geopaving.com</span>
            </p>
          </div>

          <div className="space-y-3 md:justify-self-end text-left md:text-right text-base">
            <p>
              <span className="font-semibold text-black">Estimate</span>
              <span className="inline-block w-6 text-center">:</span>#
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
            <p>
              <span className="font-semibold text-black">License #</span>
              <span className="inline-block w-6 text-center">:</span>1049285
            </p>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex justify-between border-b border-[#cfcfcf] pb-2 text-xl font-semibold text-black">
            <h2>Description</h2>
            <p>Total</p>
          </div>

          {estimateItems.length > 0 ? (
            estimateItems.map((item: any, index: number) => {
              const qty = Number(item?.quantity || 0);
              const unit = item?.unit || "SF";
              const rate = Number(item?.rate ?? item?.amount ?? 0);

              const rawMarkUp = item?.markUp;
              let markUpDisplay = "0%";
              if (rawMarkUp != null) {
                if (typeof rawMarkUp === "object") {
                  if (rawMarkUp.percentage != null) {
                    markUpDisplay = `${rawMarkUp.percentage}%`;
                  } else if (rawMarkUp.amount != null) {
                    markUpDisplay = `$${Number(rawMarkUp.amount).toFixed(2)}`;
                  }
                } else {
                  markUpDisplay = `${Number(rawMarkUp) || 0}%`;
                }
              }

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
              );
            })
          ) : (
            <div className="flex justify-between border-b border-[#e1e1e1] py-3 text-[10px] text-gray-700">
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
                  ${(Number(estimate?.grandTotal) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-9 space-y-4 border-t-2 border-orange-200">
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
                          className="w-full md:h-[700px] object-contain "
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
                    <p>{estimate.legendary}</p>
                  </div>
                </div>
              </div>
            </div>

            {fileUrls.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {fileUrls.map((url: string, index: number) => (
                  <div
                    key={`file-${index}`}
                    className="border-2 border-orange-200 bg-white p-2"
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
              <p className="text-center text-gray-500 mt-4 h-[200px] md:h-[350px] flex items-center justify-center bg-[#f9f9f9] border-2 border-orange-200">
                No files available
              </p>
            )}
          </div>
        </div>
        <div>
          <Conditions className="mt-10" />
        </div>

        {/* Mobile Buttons - wrap inline, not full width */}
        <div className="md:hidden flex flex-wrap gap-3 mt-6 items-center">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <FiPrinter />
            Print
          </button>
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
            className="inline-flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <Edit size={16} />
            Edit
          </Link>

          <button
            onClick={() => setIsReminderOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <AiOutlineMail />
            Email
          </button>

          <div className="relative">
            <button
              onClick={() => setIsStatusOpen((s) => !s)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg bg-white hover:bg-primary hover:text-white duration-200 ease-in"
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
              <div className="absolute left-0 mt-2 w-max rounded-lg bg-white shadow-md p-2 z-50 border border-gray-100">
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
            className="group inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg bg-white hover:bg-primary hover:text-white duration-200 ease-in disabled:opacity-60"
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
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:opacity-90 text-white rounded-lg"
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
                    onChange={(event) => {
                      setEmailInput(event.target.value);
                    }}
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
                <span className="text-base font-medium text-gray-700">
                  Send me a copy
                </span>
              </div>

              <div className="space-y-3">
                <label className="block text-base font-medium text-gray-900">
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
                  className="min-h-[120px] w-full rounded-xl border border-gray-200 px-4 py-3 text-base leading-6 text-gray-600 outline-none focus:border-primary"
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
                onClick={handleSendEstimateEmail}
                type="button"
                className="min-w-[112px] rounded-xl bg-primary px-6 py-3 text-base text-white transition-colors hover:opacity-90 disabled:opacity-60"
                disabled={isSendingMail}
              >
                {isSendingMail ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
