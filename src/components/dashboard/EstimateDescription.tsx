"use client";

import { ArrowLeft, Upload, User } from "lucide-react";
import Link from "next/link";

export default function EstimateDescription() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Link
        href={"/admin/estimate"}
        className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-orange-500 transition"
      >
        <ArrowLeft size={18} />
        <h2 className="text-lg font-normal">Back to Estimate</h2>
      </Link>
      <div className="flex justify-end gap-3 mb-4">
        <button className="px-5 py-2 rounded-lg border text-orange-500 border-orange-400 hover:bg-orange-50">
          Cancel
        </button>
        <button className="px-5 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600">
          Submit Estimate
        </button>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-6">
        <div className="border border-dashed border-green-300 rounded-xl p-10 flex items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-50 duration-300">
          <User className="mr-2" size={18} />
          Add Client
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
            <Upload size={18} className="mb-2" />
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
            <Upload size={18} className="mb-2" />
            Upload Image
          </div>
        </div>
      </div>
    </div>
  );
}
