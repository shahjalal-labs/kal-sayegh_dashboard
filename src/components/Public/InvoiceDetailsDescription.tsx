"use client";

import logo from "@/assets/kal-logo.png";
import {
  usePublicInvoiceDetailsQuery,
  useUpdateEmailStatusMutation,
} from "@/redux/api/admin/invoiceApi";
import html2pdf from "html2pdf.js";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";
import Conditions from "../Conditions";

const StripeCheckoutModal = dynamic(
  () => import("@/components/Public/StripeCheckoutModal"),
  { ssr: false },
);

export default function InvoiceDetailsDescription() {
  const { id } = useParams();

  const { data, isLoading, error, refetch } = usePublicInvoiceDetailsQuery(
    id as string,
  );
  const invoice = (data as any)?.result;
  const publicInvoiceId =
    (typeof invoice?.id === "string" && invoice.id) ||
    (typeof invoice?._id === "string" && invoice._id) ||
    (typeof id === "string" ? id : "");
  const amountDue = Number(invoice?.payments?.amountDue) || 0;
  const hasDueAmount = amountDue > 0;

  const searchParams = useSearchParams();
  const formatParam = searchParams?.get("format");
  const [emailMarkedRead, setEmailMarkedRead] = useState(false);
  const [updateEmailStatus] = useUpdateEmailStatusMutation();

  const [showStripeModal, setShowStripeModal] = useState(false);

  // Mark email as READ when opened from the email link
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
      } catch (err) {
        // silently ignore errors
      }
    })();
  }, [id, invoice, formatParam, emailMarkedRead, refetch, updateEmailStatus]);

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

  const handleProceedToCheckout = () => {
    if (!publicInvoiceId) return toast.error("Invoice id missing");
    setShowStripeModal(true);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:justify-between  w-11/12 mx-auto my-12 gap-10">
      <div className="pb-10">
        <div id="invoice" className="mt-4 bg-secondary  p-4 md:p-6 py-9">
          {(emailMarkedRead ||
            (invoice?.emailStatus || "").toString().toUpperCase() ===
              "READ") && (
            <div className="mb-3 text-center text-sm text-green-700 bg-green-50 rounded-md py-2">
              Email opened
            </div>
          )}

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
                <span className="font-semibold text-black">
                  Business / Tax #
                </span>
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
                  <p className="max-w-[70%] font-semibold text-black">
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

            <div className="mt-16 space-y-4 border-t-2 py-2 border-orange-200">
              <div>
                {sideMapUrls.length > 0 ? (
                  <div className=" gap-3 flex flex-col-reverse">
                    {sideMapUrls.map((url: string, index: number) => (
                      <div
                        key={`side-map-${index}`}
                        className="border border-[#dfdfdf] "
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
                            className="w-full h-[700px] object-contain"
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

                <div className="border-2 border-orange-200 bg-[#f9f9f9] ">
                  <div className="grid grid-cols-1 md:grid-cols-3 text-base text-gray-700">
                    {/* LEFT: Company Info */}
                    <div className="p-4 border-r-2 border-orange-200 space-y-2">
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
                    <div className="p-4 border-r-2 border-orange-200 space-y-2">
                      <p className="font-semibold text-gray-800">
                        {invoice?.client?.clientName || "-"}
                      </p>
                      <p>{clientAddress || "-"}</p>
                      <p>{invoice?.client?.phoneNumber || "-"}</p>
                    </div>

                    {/* RIGHT: Project Info */}
                    <div className="p-4 space-y-2">
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
                          className="w-full h-[700px] object-contain"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center  items-center border-2 border-orange-200 h-[200px] md:h-[350px] bg-[#f9f9f9] py-3 text-2xl text-center text-gray-700 ">
                  <p>No files</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-10">
            <Conditions />
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
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
        </div>
      </div>

      <div className="w-[350px] lg:w-[900px]  rounded-t-2xl">
        <div className="shadow-md rounded-2xl bg-secondary">
          {/* Invoice Number */}
          <div className="bg-secondary  p-8  top-6 h-fit  mt-4">
            <div className="text-center pb-6 ">
              <h3 className="text-gray-600 text-xl font-semibold mb-2">
                Invoice #:
              </h3>
              <p className="text-2xl font-bold text-black">
                {invoice?.id?.slice(-4) || "-"}
              </p>
            </div>

            {/* Make Payment Text */}
            <div className="text-center  ">
              <h4 className="text-lg font-bold text-black mb-3">
                MAKE PAYMENT BELOW TO
              </h4>
              <p className="text-xl font-semibold text-black">
                Geo Paving and Sealcoating
              </p>
            </div>

            {/* Amount Due */}
            <div className="text-center py-6 ">
              <p className="text-gray-600 text-sm font-semibold mb-2 uppercase">
                DEPOSIT AMOUNT DUE
              </p>
              <p className="text-4xl font-bold text-black">
                ${amountDue.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Checkout Options */}
          {!showStripeModal && hasDueAmount && (
            <div className="pt-6 bg-[#F8F9F5]  w-[calc(100%)] pb-8 text-center">
              <p className="text-center  text-xl font-semibold mb-4 uppercase">
                CHECKOUT OPTIONS
              </p>

              <button
                onClick={handleProceedToCheckout}
                className="mx-auto bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors mb-4"
              >
                Proceed To Checkout
              </button>
            </div>
          )}
          {showStripeModal && publicInvoiceId && hasDueAmount && (
            <StripeCheckoutModal
              invoiceId={publicInvoiceId}
              onClose={() => setShowStripeModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
