import cloud from "@/assets/dashboard/cloud-upload.png";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Upload() {
  return (
    <div className="md:px-8 bg-none md:bg-secondary rounded-2xl py-4">
      <div className="hidden md:flex flex-row justify-between items-center gap-3">
        <Link
          href={"/admin/estimate"}
          className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} />
          <h2 className="text-lg font-normal">Back to Estimate</h2>
        </Link>
        <div className="space-x-4">
          <button className="px-6 py-2 border-[1px] border-primary text-primary hover:bg-primary transition-colors duration-300 hover:text-white rounded-xl ">
            Cancel
          </button>
          <button className="px-6 py-2 bg-primary hover:bg-primary/90  text-white font-normal rounded-xl transition-colors">
            Submit Estimate
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center py-2 md:hidden block">
        {/* Arrow button on the left */}
        <Link
          href={"/admin/estimate"}
          className="absolute left-0 flex items-center gap-2 text-gray-700 hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Centered title */}
        <h2 className="text-2xl font-medium">Estimates</h2>
      </div>

      <div className="border-2 border-dashed border-primary bg-[#E279320D] rounded-lg p-10 text-center hover:bg-orange-50 transition cursor-pointer mt-12">
        <input type="file" className="hidden" id="fileUpload" />

        <label
          htmlFor="fileUpload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          <Image
            src={cloud}
            alt="cloud"
            width={40}
            height={40}
            className="mb-2"
          />

          <span className="text-primary font-medium">Click to upload</span>

          <span className="text-sm text-gray-500">or drag and drop</span>
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-[356px] flex flex-col space-y-3">
          <div className="flex justify-between items-center border-b py-3">
            <span className="text-gray-700 font-medium text-base ">
              Subtotal
            </span>
            <span className="font-semibold text-gray-900">$0.00</span>
          </div>

          <div className="flex justify-between items-center border-b py-3">
            <span className="text-gray-700 font-medium">Markup</span>

            <div className="flex items-center gap-2"></div>

            <button className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
              Add
            </button>
          </div>

          <div className="flex justify-between items-center border-b py-3">
            <span className="text-gray-700 font-medium">Discount</span>

            <button className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
              Add
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-medium">Request a deposit</span>

            <div className="flex items-center gap-2"></div>

            <button className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
              Add
            </button>
          </div>

          <div className="flex justify-between items-center border-t border-gray-300 pt-3">
            <span className="text-gray-900 font-bold text-lg">Total(USD)</span>
            <span className="text-orange-500 font-bold text-lg">0</span>
          </div>
        </div>
      </div>

      <button className="px-5 py-2 md:hidden rounded-lg bg-primary text-white hover:bg-primary/90 w-full transition-colors mt-8">
        Submit
      </button>
    </div>
  );
}
