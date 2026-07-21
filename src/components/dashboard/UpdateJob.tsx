"use client";

import { ImageUploadArea } from "@/components/ui/ImageUploadArea";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { useUpdateJobRequestMutation } from "@/redux/api/admin/jobApi";

interface JobFormData {
  title: string;
  office: string;
  date: string;
  location: string;
  phone: string;
  email: string;
  address: string;
  note: string;
}

interface CreateJobFormProps {
  jobId: string;
  onClose?: () => void;
}

export default function UpdateJob({ jobId, onClose }: CreateJobFormProps) {
  const [jobUpdate] = useUpdateJobRequestMutation();

  const [form, setForm] = useState<JobFormData>({
    title: "",
    office: "",
    date: "",
    location: "",
    phone: "",
    email: "",
    address: "",
    note: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);

  const handleChange = (field: keyof JobFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const urls = fileArray.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...fileArray]);
    setPreview((prev) => [...prev, ...urls]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));

    setPreview((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleJobUpdate = async () => {
    try {
      const formData = new FormData();

      const bodyData = {
        title: form.title,
        address: form.address,
        contact: form.phone,
        date: form.date ? new Date(form.date).toISOString() : "",
        email: form.email,
        note: form.note,
        officeLatitude: 23.8103,
        officeLongitude: 90.4125,
      };

      formData.append("bodyData", JSON.stringify(bodyData));

      images.forEach((file) => {
        formData.append("jobRequestsImage", file);
      });

      await jobUpdate({
        id: jobId,
        data: formData,
      }).unwrap();

      toast.success("Job updated successfully!");

      setForm({
        title: "",
        office: "",
        date: "",
        location: "",
        phone: "",
        email: "",
        address: "",
        note: "",
      });

      setImages([]);
      setPreview([]);

      onClose?.();
    } catch (err) {
      console.log(err);
      toast.error("Update failed!");
    }
  };

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <label className="text-sm text-gray-600">Title</label>
        <input
          type="text"
          value={form.title}
          placeholder="Title"
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      {/* Office */}
      <div>
        <label className="text-sm text-gray-600">Office Name</label>
        <input
          type="text"
          value={form.office}
          onChange={(e) => handleChange("office", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
          placeholder="Office"
        />
      </div>

      {/* Date */}
      <div>
        <label className="text-sm text-gray-600">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      {/* Location */}
      <div>
        <label className="text-sm text-gray-600">Office Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => handleChange("location", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="text-sm text-gray-600">Contact Number</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-sm text-gray-600">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      {/* Address */}
      <div>
        <label className="text-sm text-gray-600">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      {/* Note */}
      <div>
        <label className="text-sm text-gray-600">Internal Notes</label>
        <textarea
          rows={5}
          value={form.note}
          onChange={(e) => handleChange("note", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl resize-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Upload Images</label>

        <ImageUploadArea
          onFiles={(files) => {
            const urls = files.map((f) => URL.createObjectURL(f));
            setImages((prev) => [...prev, ...files]);
            setPreview((prev) => [...prev, ...urls]);
          }}
        />

        {/* Preview */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {preview.map((img, i) => (
            <div key={i} className="relative">
              <Image
                src={img}
                alt="preview"
                width={120}
                height={120}
                className="rounded-lg object-cover"
              />

              <button
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-5 mt-5">
          <button
            onClick={onClose}
            className="border-primary border-2 text-primary px-4 py-2 rounded-xl"
          >
            Close
          </button>

          <button
            onClick={handleJobUpdate}
            className="bg-primary text-white px-4 py-2 rounded-xl"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
