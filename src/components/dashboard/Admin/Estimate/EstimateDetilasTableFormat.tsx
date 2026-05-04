"use client";

import logo from "@/assets/kal-logo.png";
import Conditions from "@/components/Conditions";
import {
  useGetEstimateByIdQuery,
  useSendEstimateMailMutation,
} from "@/redux/api/admin/estimateApi";
import html2pdf from "html2pdf.js";
import { Edit, WandSparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Fragment } from "react";
import { AiOutlineMail } from "react-icons/ai";
import { FiArrowLeft, FiDownload } from "react-icons/fi";
import { ColorRing } from "react-loader-spinner";
import Swal from "sweetalert2";

export default function EstimateDetilasTableFormat() {
  const { id } = useParams();

  const { data, isLoading, error } = useGetEstimateByIdQuery(id as string);
  const estimate = data?.result;

  const [sendEstimateMail, { isLoading: isSendingMail }] =
    useSendEstimateMailMutation();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value || 0);

  const normalizedItems = Array.isArray(estimate?.items) ? estimate.items : [];

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
      filename: `${estimate?.estimateName || "estimate"}.pdf`,
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
    if (!id) return;

    const result = await Swal.fire({
      title: "Send Estimate",
      text: "Do you want to send this estimate by email?",
      icon: "question",
      confirmButtonText: "Send Email",
      showCancelButton: true,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const to = estimate?.client?.email ? [estimate.client.email] : [];

    if (to.length === 0) {
      await Swal.fire({
        title: "Missing email",
        text: "No recipient email was found for this estimate.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      await sendEstimateMail({
        estimateId: id as string,
        to,
        cc: [],
        bcc: [],
        message: "We are pleased to work with you. Please review the estimate.",
        sendMeCopy: true,
        subject: "Your Estimate  from Geo Paving and Sealcoating",
      }).unwrap();
      await Swal.fire({
        title: "Sent",
        text: "Estimate email sent successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch {
      await Swal.fire({
        title: "Failed",
        text: "Failed to send estimate email. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
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

  const unitCost =
    normalizedItems.length > 0
      ? (estimate?.grandTotal || 0) / normalizedItems.length
      : estimate?.grandTotal || 0;

  const editEstimateId =
    typeof id === "string"
      ? id
      : Array.isArray(id)
        ? id[0]
        : estimate?.id || "";

  return (
    <div>
      <Link
        href="/admin/estimate"
        className="flex items-center gap-2 hover:underline text-gray-500"
      >
        <FiArrowLeft />
        Back To Estimate List Page
      </Link>

      <div className="flex flex-col md:flex-row md:justify-between mt-7">
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
            onClick={handleSendEstimateEmail}
            disabled={isSendingMail}
            className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary"
          >
            <AiOutlineMail />
            Email
          </button>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button className="flex items-center gap-2 px-4 py-2 border-primary duration-300 ease-in border hover:text-white text-primary rounded-lg hover:bg-primary">
            <WandSparkles size={16} />
            Generate Invoice
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

      <div id="invoice" className="bg-secondary rounded-2xl p-5 md:p-8 mt-4 ">
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
          </div>
        </div>

        <div
          data-pdf-table-wrapper
          className="mt-8 border border-gray-500 overflow-x-auto"
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
              {normalizedItems.length > 0 ? (
                normalizedItems.map((item: any, index: number) => {
                  const qty = Number(item?.quantity || 1);
                  const unit = item?.unit || "SF";
                  const unitCostVal = Number(
                    item?.rate ?? item?.amount ?? unitCost ?? 0,
                  );

                  // Determine markup display (could be object with percentage or amount)
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
                      const m = Number(rawMarkUp) || 0;
                      markUpDisplay = `${m}%`;
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

                  // Use backend subtotal if provided, otherwise compute
                  const rowPrice = Number(item?.subTotal ?? unitCostVal * qty);

                  return (
                    <Fragment key={`row-${index}`}>
                      <tr key={`desc-${index}`} className="bg-gray-200">
                        <td className="border border-gray-500 px-3 py-2 font-medium text-black">
                          {item?.description || "-"}
                        </td>
                        <td
                          className="border border-gray-500 px-3 py-2"
                          colSpan={7}
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
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td className="border border-gray-500 px-3 py-3" colSpan={8}>
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
                  {formatCurrency(Number(estimate?.grandTotal || 0))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Conditions className="mt-8" />
      </div>
    </div>
  );
}
