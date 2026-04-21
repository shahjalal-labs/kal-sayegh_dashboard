"use client";

import logo from "@/assets/kal-logo.png";
import { useGetInvoiceByIdQuery } from "@/redux/api/admin/invoiceApi";
import html2pdf from "html2pdf.js";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";

export default function InvoiceDetailsDescription() {
  const { id } = useParams();

  const { data, isLoading, error } = useGetInvoiceByIdQuery(id as string);
  const invoice = (data as any)?.result;

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

  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

  return (
    <div className="pb-10">
      <Link
        href="/admin/invoice"
        className="flex items-center gap-2 hover:underline text-gray-500"
      >
        <FiArrowLeft />
        Back To Invoice List Page
      </Link>

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
                className="flex justify-between gap-4 border-b border-[#e1e1e1] py-3 text-base space-y-3 leading-5 text-gray-700"
              >
                <div className="space-y-3">
                  <p className="font-semibold text-black">Invoice Line Item</p>
                  <p>Item ID: {item?.id || "-"}</p>
                  <p>Quantity: {Number(item?.quantity) || 0}</p>
                </div>
                <p className="font-semibold text-black whitespace-nowrap">
                  ${(Number(item?.subTotal) || 0).toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div className="flex justify-between border-b border-[#e1e1e1] py-3 text-[10px] text-gray-700">
              <p>No items</p>
              <p>$0.00</p>
            </div>
          )}

          <div className="mt-2 flex justify-end">
            <div className="w-full max-w-[300px] space-y-2 text-base">
              <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                <p className="font-semibold">Subtotal</p>
                <p className="font-semibold">${subtotal.toFixed(2)}</p>
              </div>
              <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                <p className="font-semibold">Markup</p>
                <p className="font-semibold">
                  ${(Number(invoice?.additionalMarkUp) || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                <p className="font-semibold">Discount</p>
                <p className="font-semibold">
                  ${(Number(invoice?.discountAmount) || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                <p className="font-semibold">Deposit</p>
                <p className="font-semibold">
                  ${(Number(invoice?.depositAmount) || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between border-b border-[#e1e1e1] pb-1">
                <p className="font-semibold">Total</p>
                <p className="font-semibold">
                  ${(Number(invoice?.grandTotal) || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-9 space-y-4">
            {sideMapUrls.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {sideMapUrls.map((url: string, index: number) => (
                  <div
                    key={`side-map-${index}`}
                    className="border border-[#dfdfdf] bg-white p-2"
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
                        className="w-full h-auto object-contain"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {sideMapUrls.length > 0 && fileUrls.length > 0 && (
              <div className="py-3">
                <div className="w-full border-t-2 border-orange-300" />
              </div>
            )}

            {fileUrls.length > 0 && (
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
            )}
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
    </div>
  );
}
