"use client";

import logo from "@/assets/kal-logo.png";
import {
  useGetEstimateByIdQuery,
  useUpdateEstimateSignatureMutation,
  useUpdateEstimateStatusMutation,
} from "@/redux/api/admin/estimateApi";
import { format } from "date-fns";
import html2pdf from "html2pdf.js";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";
import Conditions from "../Conditions";

export default function EstimateDetailsDescription() {
  const { id } = useParams();
  const { data, isLoading, error, refetch } = useGetEstimateByIdQuery(
    id as string,
  );
  const estimate = data?.result;

  const [estimateSign] = useUpdateEstimateSignatureMutation();

  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signerName, setSignerName] = useState("");

  const [updateEstimateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateEstimateStatusMutation();

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

  if (error || !estimate) {
    return (
      <div className="space-y-4">
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

  const handleDownload = () => {
    const element = document.getElementById("invoice");
    if (!element) return;

    html2pdf()
      .set({
        margin: 0.5,
        filename: `${estimate?.estimateName || "estimate"}.pdf`,
        image: {
          type: "jpeg",
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(element)
      .save();
  };

  const handleSignAndApprove = async () => {
    const trimmedName = signerName.trim();

    if (!trimmedName) {
      toast.error("Please type your name.");
      return;
    }

    try {
      await estimateSign({
        estimateId: editEstimateId,
        signedName: trimmedName,
        emailStatus: "READ",
      }).unwrap();

      toast.success("The document has been successfully signed.");
      setIsSignModalOpen(false);
      setSignerName("");
      refetch();
    } catch {
      toast.error("Failed to sign estimate");
    }
  };

  return (
    <>
      <div className="w-full min-h-screen px-12 py-10">
        <div className="flex flex-col items-start gap-6 lg:flex-row">
          <div className="">
            <div className="flex w-full items-center justify-between px-4">
              <h1 className="flex-1 text-center text-xl font-bold text-gray-600 md:hidden">
                Estimate Details
              </h1>
              <div className="w-[120px]" />
            </div>

            <div
              id="invoice"
              className="mt-4 rounded-2xl bg-secondary p-4 py-9 md:p-6 w-full max-w-none"
            >
              <h1 className="text-center text-xl font-semibold uppercase tracking-[0.16em] text-gray-400">
                Estimate
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
                  <p>{estimate?.client?.clientName || "-"}</p>
                  <p>{estimate?.client?.address || "-"}</p>
                  <p>{estimate?.client?.city || "-"}</p>
                  <p>{estimate?.client?.zip || "-"}</p>
                  <p>{estimate?.client?.phoneNumber || "-"}</p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-1 gap-6 text-[10px] leading-5 text-gray-700 md:grid-cols-2">
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
                    Email:{" "}
                    <span className="font-normal">kal@geopaving.com</span>
                  </p>
                  <p className="font-semibold">
                    Web: <span className="font-normal">www.geopaving.com</span>
                  </p>
                </div>

                <div className="space-y-3 text-left text-base md:justify-self-end md:text-right">
                  <p>
                    <span className="font-semibold text-black">Estimate</span>
                    <span className="inline-block w-6 text-center">:</span>#
                    {editEstimateId.slice(-4) || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-black">Date</span>
                    <span className="inline-block w-6 text-center">:</span>
                    {estimate?.date || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-black">
                      Business / Tax #
                    </span>
                    <span className="inline-block w-6 text-center">:</span>
                    {estimate?.client?.zip || "-"}
                  </p>
                  <p>
                    <span className="font-semibold text-black">License #</span>
                    <span className="inline-block w-6 text-center">:</span>
                    1049285
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
                      item?.subTotal != null
                        ? Number(item.subTotal)
                        : rate * qty;

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
                            <p className="text-base text-gray-600">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex w-full items-center justify-end md:w-1/5">
                          <div className="text-right">
                            <div className="font-semibold text-black">
                              ${price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
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
                        ${(Number(estimate?.grandTotal) || 0).toFixed(2)}
                      </p>
                    </div>
                    {Number(estimate?.depositAmount || 0) > 0 && (
                      <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                        <p className="font-semibold">Deposit</p>
                        <p className="font-semibold">
                          ${(Number(estimate?.depositAmount) || 0).toFixed(2)}
                        </p>
                      </div>
                    )}
                    {Number(estimate?.discountAmount || 0) > 0 && (
                      <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                        <p className="font-semibold">Discount</p>
                        <p className="font-semibold">
                          -${(Number(estimate?.discountAmount) || 0).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-9 space-y-4 ">
                  {sideMapUrls.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-3">
                      {sideMapUrls.map((url: string, index: number) => (
                        <div
                          key={`side-map-${index}`}
                          className="border border-[#dfdfdf] bg-white p-2"
                        >
                          {isVideoUrl(url) ? (
                            <video
                              controls
                              className="h-auto w-full rounded-sm"
                            >
                              <source src={url} />
                            </video>
                          ) : (
                            <Image
                              src={url}
                              alt={`Side Map ${index + 1}`}
                              width={900}
                              height={520}
                              className="h-auto w-full object-contain"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 border border-[#d7d7d7] bg-white">
                    <div className="grid grid-cols-1 text-base text-gray-700 md:grid-cols-3">
                      <div className="border-b border-[#e1e1e1] p-3 md:border-b-0 md:border-r text-lg font-normal space-y-3">
                        <Image
                          src={logo}
                          alt="Logo"
                          width={100}
                          height={52}
                          className="mb-2 h-auto w-[76px] md:w-[200px]"
                        />
                        <p>Cucamonga, CA 91730</p>
                        <p>Costa Mesa, CA 92626</p>
                        <p>Phone: (951) 463-7002</p>
                        <p>Email: kal@geopaving.com</p>
                        <p>Web: www.geopaving.com</p>
                      </div>
                      <div className="border-b border-[#e1e1e1] p-3 md:border-b-0 md:border-r text-lg font-normal space-y-2">
                        <p>Name: {estimate?.client?.clientName || "-"}</p>
                        <p>{estimate?.client?.address || "-"}</p>
                        <p>{estimate?.client?.city || "-"}</p>
                      </div>
                      <div className="p-3 font-normal text-lg">
                        <p>{estimate.legendary}</p>
                      </div>
                    </div>
                  </div>

                  {fileUrls.length > 0 && (
                    <div className="grid grid-cols-1 gap-3">
                      {fileUrls.map((url: string, index: number) => (
                        <div
                          key={`file-${index}`}
                          className="border border-[#dfdfdf] bg-white p-2"
                        >
                          {isVideoUrl(url) ? (
                            <video
                              controls
                              className="h-auto w-full rounded-sm"
                            >
                              <source src={url} />
                            </video>
                          ) : (
                            <Image
                              src={url}
                              alt={`File ${index + 1}`}
                              width={900}
                              height={520}
                              className="h-[700px] w-full object-contain"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="my-16">
                    <Conditions className="mt-10" />
                  </div>

                  <div className="mt-6 flex justify-end text-lg text-gray-700 pt-16">
                    {estimate?.isSigned ? (
                      <div className=" rounded-lg bg-white text-center  space-y-4">
                        <div className="marck text-2xl">
                          {estimate?.signedName
                            ? `${estimate.signedName} `
                            : "Signature"}
                        </div>

                        <div className="mx-auto my-4 h-[1px] w-[450px] bg-gray-400" />

                        {estimate?.signedAt && (
                          <div className="">
                            Signed on:{" "}
                            {format(new Date(estimate.signedAt), "MM/dd/yyyy")}
                          </div>
                        )}
                        <p className="">{estimate?.client?.clientName}</p>
                      </div>
                    ) : (
                      <div className="w-full max-w-[720px] rounded-lg bg-white p-6 text-center shadow-sm">
                        <div className="">Not Signed</div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-3 md:hidden">
                    <button
                      onClick={() => setIsSignModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:opacity-90"
                    >
                      Sign & Approve
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-primary duration-300 ease-in hover:bg-primary hover:text-white"
                    >
                      <FiPrinter />
                      Print
                    </button>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white hover:opacity-90"
                    >
                      <FiDownload />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden w-full self-start lg:block lg:w-[400px] lg:sticky lg:top-20">
            <div className="rounded-2xl border border-white bg-secondary p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm">
              <button
                onClick={() => setIsSignModalOpen(true)}
                disabled={estimate?.isSigned || isUpdatingStatus}
                className="w-full rounded-xl bg-[#E97D2A] px-4 py-3 text-center text-base font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              >
                Sign and Approved
              </button>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E97D2A] bg-white px-4 py-3 text-base font-medium text-[#E97D2A] transition-colors hover:bg-[#fff5ee]"
                >
                  <FiPrinter />
                  Print
                </button>
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#E97D2A] bg-white px-4 py-3 text-base font-medium text-[#E97D2A] transition-colors hover:bg-[#fff5ee]"
                >
                  <FiDownload />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSignModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 px-4 py-6">
          <div className="w-full max-w-[760px] rounded-[28px] bg-white px-6 py-6 shadow-2xl md:px-8 md:py-8">
            <h2 className="text-[26px] font-semibold text-gray-900">
              Sign Document
            </h2>

            <div className="mt-6 space-y-3">
              <label className="block text-lg font-semibold text-gray-600">
                Type your name
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(event) => setSignerName(event.target.value)}
                placeholder="Type your name"
                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-base outline-none placeholder:text-gray-400 focus:border-primary"
              />
            </div>

            <div className="mt-10 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => {
                  setIsSignModalOpen(false);
                  setSignerName("");
                }}
                className="min-w-[120px] rounded-xl border border-primary px-6 py-3 text-base font-medium text-primary transition-colors hover:bg-primary hover:text-white duration-300 ease-in"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSignAndApprove}
                disabled={isUpdatingStatus}
                className="min-w-[120px] rounded-xl bg-primary px-6 py-3 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
