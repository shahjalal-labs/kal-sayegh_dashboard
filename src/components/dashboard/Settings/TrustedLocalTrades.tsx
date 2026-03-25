"use client";

import galleryIcon from "@/assets/dashboard/gallery.png";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/Pagination";
import { useAllTradesQuery, useCreateTradeMutation } from "@/redux/api/authApi";

import { Dialog } from "@headlessui/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TrustedLocalTrades() {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    tradeLogo: null as File | null,
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);

  const [createTrade, { isLoading }] = useCreateTradeMutation();
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data: allTrades, refetch } = useAllTradesQuery({ page, limit });

  const totalPages = allTrades?.result?.totalPages || 1;

  const handleChange = (field: string, value: string | File | null) => {
    setForm({ ...form, [field]: value });
  };

  // Generate preview when tradeLogo changes
  useEffect(() => {
    if (!form.tradeLogo) {
      setPreview(null);
      setIsPdf(false);
      return;
    }

    const file = form.tradeLogo;
    if (file.type === "application/pdf") {
      setIsPdf(true);
      setPreview(null);
    } else if (file.type.startsWith("image/")) {
      setIsPdf(false);
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setIsPdf(false);
      setPreview(null);
    }
  }, [form.tradeLogo]);

  const handleCreateTrade = async () => {
    try {
      if (!form.tradeLogo) {
        toast.error("Logo image is required");
        return;
      }

      const formData = new FormData();
      formData.append("companyName", form.title);
      formData.append("description", form.description);
      formData.append("tradeLogo", form.tradeLogo, form.tradeLogo.name);

      await createTrade(formData).unwrap();

      toast.success("Trade created successfully!");
      setForm({ title: "", description: "", tradeLogo: null });
      setPreview(null);
      setIsPdf(false);
      setIsOpen(false);
      refetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to create trade");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-2xl font-semibold">
          Trusted Local Trades
        </h2>
        <button
          className="rounded-full border border-primary text-primary font-semibold px-4 py-2 hover:bg-primary hover:text-white transition"
          onClick={() => setIsOpen(true)}
        >
          + Add Trusted Trades
        </button>
      </div>

      {/* Trades List */}
      <div className="my-12 bg-white p-4 rounded-md shadow-sm">
        {allTrades?.result?.trades?.length ? (
          allTrades?.result?.trades?.map((trade: any) => (
            <div key={trade.id} className="bg-white p-4 rounded-md shadow-sm">
              <div className="space-y-3">
                <Image
                  src={trade.logo}
                  alt={trade.companyName}
                  width={80}
                  height={80}
                  className="rounded-md"
                />
                <h3 className="text-lg font-semibold">{trade.companyName}</h3>
                <p className="text-base font-medium">{trade.description}</p>
              </div>
            </div>
          ))
        ) : (
          <p>No trades found.</p>
        )}

        {/* Pagination */}

        <div className="mt-4 flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((prev) => Math.max(prev - 1, 1));
                  }}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={page === pageNumber}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setPage((prev) => Math.min(prev + 1, totalPages));
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-[1000px] rounded-xl bg-white p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-bold">
                Add Trusted Local Trades
              </Dialog.Title>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter title"
                  className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Enter description"
                  rows={5}
                  className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-green-600 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-3 relative">
                <Image
                  src={galleryIcon}
                  alt="Upload"
                  width={30}
                  height={30}
                  className="mx-auto"
                />
                <p className="text-gray-700 font-medium text-lg">Upload Logo</p>
                <p className="text-gray-500 text-sm">Supports: JPG, PNG, PDF</p>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) =>
                      handleChange(
                        "tradeLogo",
                        e.target.files ? e.target.files[0] : null,
                      )
                    }
                  />
                  <span className="inline-block bg-primary text-white px-4 py-2 rounded-full transition">
                    Choose a file
                  </span>
                </label>

                {/* Preview inside the box */}
                {preview && (
                  <div className="relative w-full h-40 mt-3 border rounded-md">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain rounded-md"
                    />
                  </div>
                )}

                {isPdf && (
                  <p className="mt-2 text-sm text-gray-600">
                    PDF selected: {form.tradeLogo?.name}
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-start gap-3 mt-4">
              <div className="p-[1px] rounded-md bg-primary inline-block">
                <button
                  className="bg-white text-primary px-6 py-2 rounded-md w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
              <button
                onClick={handleCreateTrade}
                className="bg-primary text-white px-6 py-2 rounded-md"
              >
                Save Change
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
