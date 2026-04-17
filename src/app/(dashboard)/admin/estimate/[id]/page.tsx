"use client";

import logo from "@/assets/kal-logo.png";
import { useGetEstimateByIdQuery } from "@/redux/api/admin/estimateApi";
import html2pdf from "html2pdf.js";
import Image from "next/image";
import Link from "next/link";
import { FiArrowLeft, FiDownload, FiPrinter } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";

export default function EstimateDetails({
  params,
}: {
  params: { id: string };
}) {
  const { data, isLoading, error } = useGetEstimateByIdQuery(params.id);

  const estimate = data?.result;

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

  if (isLoading)
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

  return (
    <div>
      <Link
        href="/admin/estimate"
        className="flex items-center gap-2  hover:underline"
      >
        <FiArrowLeft />
        Back To Estimate List Page
      </Link>
      <div id="invoice" className="bg-secondary rounded-2xl p-6 px-8 mt-4">
        <h1 className="text-center font-normal text-2xl text-gray-500">
          Estimate
        </h1>
        <div className="flex justify-between mt-6">
          <Image
            src={logo}
            alt="Logo"
            width={150}
            height={80}
            className="h-auto w-[120px]"
          />
          <div className="text-right space-y-3">
            <p className="text-lg font-semibold">Prepared For</p>

            <p>{estimate?.client?.clientName}</p>
            <p>{estimate?.client?.address}</p>
            <p>{estimate?.client?.city}</p>
            <p>{estimate?.client?.state}</p>
          </div>
        </div>

        <div className="flex justify-between mt-9 ">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">
              Geo Paving and Sealcoating
            </h2>

            <p className="font-medium">{estimate?.client?.address}</p>

            <p>
              <span className="font-semibold">Phone:</span>{" "}
              {estimate?.client?.phoneNumber}
            </p>

            <p>
              <span className="font-semibold">Email:</span>{" "}
              {estimate?.client?.email}
            </p>

            <p>
              <span className="font-semibold">Web:</span> www.geopaving.com
            </p>
          </div>

          <div className="text-right space-y-3">
            <p>
              <span className="font-semibold">Estimate:</span>{" "}
              {estimate?.estimateName}
            </p>

            <p>
              <span className="font-semibold">Date:</span> {estimate?.date}
            </p>
          </div>
        </div>

        <div className=" mt-9">
          <div className="flex justify-between border-b py-4">
            <h2 className="font-semibold text-lg">Description</h2>
            <p className="font-semibold text-lg">Total</p>
          </div>

          <div>
            <div className="flex justify-between border-b py-4">
              <p>{estimate?.items?.[0]?.description}</p>
              <p>${estimate?.grandTotal}</p>
            </div>
          </div>

          <div className="mt-9 space-y-4">
            {/* SIDE MAP */}
            {estimate?.sideMap && (
              <div>
                <Image
                  src={estimate.sideMap}
                  alt="Side Map"
                  width={400}
                  height={300}
                  className="rounded-lg object-cover"
                />
              </div>
            )}

            {/* FILE URLS (multiple images) */}
            <div className="gap-3 space-y-3">
              {estimate?.fileUrls?.map((url: any, index: any) => (
                <Image
                  key={index}
                  src={url}
                  alt={`File ${index}`}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          {/* PRINT BUTTON */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <FiPrinter />
            Print
          </button>

          {/* DOWNLOAD BUTTON */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-primary  text-white rounded-lg hover:opacity-90"
          >
            <FiDownload />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
