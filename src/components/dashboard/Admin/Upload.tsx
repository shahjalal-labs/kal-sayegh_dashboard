import { ArrowLeft, UploadCloud } from "lucide-react";
import Link from "next/link";

export default function Upload() {
  return (
    <div className="px-8 bg-white rounded-2xl py-4">
      <div className="flex gap-3 justify-between">
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

      <div className="border-2 border-dashed border-primary bg-[#E279320D] rounded-lg p-10 text-center hover:bg-orange-50 transition cursor-pointer mt-12">
        <input type="file" className="hidden" id="fileUpload" />

        <label
          htmlFor="fileUpload"
          className="cursor-pointer flex flex-col items-center gap-3"
        >
          {/* Icon */}
          <UploadCloud className="w-10 h-10 text-primary" />

          <span className="text-primary font-medium">Click to upload</span>

          <span className="text-sm text-gray-500">or drag and drop</span>
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-[356px] flex flex-col space-y-3">
          <div className="flex justify-between items-center border-b p-3">
            <span className="text-gray-700 font-medium text-base ">
              Subtotal
            </span>
            <span className="font-semibold text-gray-900">$0.00</span>
          </div>

          <div className="flex justify-between items-center border-b p-3">
            <span className="text-gray-700 font-medium">Markup</span>

            <div className="flex items-center gap-2"></div>

            <button className="text-orange-500 hover:text-orange-600 font-semibold transition-colors">
              Add
            </button>
          </div>

          <div className="flex justify-between items-center border-b p-3">
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
    </div>
  );
}
