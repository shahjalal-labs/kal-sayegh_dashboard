"use client";

import { useJobRequestByImageMutation } from "@/redux/api/jobApi";
import { useState } from "react";
import { ColorRing } from "react-loader-spinner";

interface CreateJobByImageProps {
  officeId: string;
  onClose: () => void;
}

export default function CreateJobByImage({
  officeId,
  onClose,
}: CreateJobByImageProps) {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [createJobByImage, { isLoading, isError, error }] =
    useJobRequestByImageMutation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !image || !officeId) {
      alert("Please provide a title and an image.");
      return;
    }

    const formData = new FormData();
    formData.append(
      "bodyData",
      JSON.stringify({ title, officeId, date: new Date().toISOString() }),
    );
    formData.append("jobRequestsImage", image);

    try {
      await createJobByImage(formData).unwrap();
      onClose();
    } catch (err) {
      console.error("Failed to create job by image:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700"
        >
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-gray-700"
        >
          Job Image
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
        />
      </div>
      {isError && (
        <div className="text-red-500 text-sm">
          Error: {JSON.stringify(error)}
        </div>
      )}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
        >
          {isLoading ? (
            <ColorRing
              visible={true}
              height="20"
              width="20"
              colors={["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"]}
            />
          ) : (
            "Create Job"
          )}
        </button>
      </div>
    </form>
  );
}
