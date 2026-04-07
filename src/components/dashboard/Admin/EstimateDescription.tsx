"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";

import cloud from "@/assets/dashboard/cloud-upload.png";
import Image from "next/image";

export default function EstimateDescription() {
  return (
    <div className=" bg-gray-50 min-h-screen">
      <div className="flex  md:justify-between gap-3 mb-4">
        <Link
          href={"/admin/estimate"}
          className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} />
          <h2 className="text-lg font-normal hidden md:block">
            Back to Estimate
          </h2>
        </Link>
        <h2 className="text-lg md:text-2xl font-normal md:hidden block ">
          Add Estimate
        </h2>
        <div className="space-x-4 hidden md:block">
          <Link href={"/admin/estimate"}>
            <button className="px-6 py-2 border-[1px] border-primary text-primary hover:bg-primary transition-colors duration-300 hover:text-white rounded-xl ">
              Cancel
            </button>
          </Link>
          <button className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
            Submit Estimate
          </button>
        </div>
      </div>

      <div className="md:bg-secondary bg-none border-none md:border rounded-xl md:p-6 space-y-6">
        <div className="border border-dashed border-primary rounded-xl p-10 flex items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-50 duration-300">
          <AiOutlineUserAdd className="mr-2 inline-block" size={20} />
          <span>Add Client</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Estimate#</label>
            <input
              placeholder="Estimate#"
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Date</label>
            <input
              type="date"
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Expiration Date</label>
            <input
              type="date"
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">PO Number</label>
            <input
              placeholder="PO Number"
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            rows={4}
            placeholder="Description"
            className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Side Map</label>
          <div className="mt-2 border border-dashed border-orange-300 rounded-xl p-10 flex flex-col items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-100/60 bg-orange-50 duration-300">
            <Image
              src={cloud}
              alt="cloud"
              width={40}
              height={40}
              className="mb-2"
            />
            Upload Side Map
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Legendary</label>
          <input
            placeholder="Legendary"
            className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Upload Image</label>
          <div className="mt-2 border border-dashed border-orange-300 rounded-xl p-10 flex flex-col items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-100/60 bg-orange-50 duration-300">
            <Image
              src={cloud}
              alt="cloud"
              width={40}
              height={40}
              className="mb-2"
            />
            Upload Image
          </div>
        </div>

        <button className="px-5 py-2 md:hidden rounded-lg bg-primary text-white hover:bg-primary/90 w-full transition-colors">
          Submit
        </button>
      </div>
    </div>
  );
}
