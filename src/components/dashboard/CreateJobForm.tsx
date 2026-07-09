"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUploadArea } from "@/components/ui/ImageUploadArea";

import {
  useCreateJobRequestMutation,
  useGetOfficesQuery,
} from "@/redux/api/jobApi";

interface FormData {
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
  selectedJob?: any;

  onClose?: () => void;
}

export default function CreateJobForm({
  selectedJob,
  onClose,
}: CreateJobFormProps) {
  const { data } = useGetOfficesQuery({});
  const offices = data?.result;

  const [createJobRequest] = useCreateJobRequestMutation();

  const [form, setForm] = useState<FormData>({
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

  const handleChange = (field: keyof FormData, value: string) => {
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

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      const bodyData = {
        title: form.title,
        address: form.address,
        contact: form.phone,
        date: form.date ? new Date(form.date).toISOString() : "",
        email: form.email,
        note: form.note,
        officeId: form.office,
        officeLatitude: 23.8103,
        officeLongitude: 90.4125,
      };

      formData.append("bodyData", JSON.stringify(bodyData));

      images.forEach((file) => {
        formData.append("jobRequestsImage", file);
      });

      await createJobRequest(formData).unwrap();

      toast.success("Job request created successfully!");

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
    } catch (err) {
      console.log(err);
      toast.error("Failed to create job request.");
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm text-gray-600">Title</label>
        <input
          type="text"
          value={form.title}
          placeholder="Title"
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Office Name</label>
        <select
          value={form.office}
          onChange={(e) => handleChange("office", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
        >
          <option value="">Select Office</option>

          {offices?.map((office: any) => (
            <option key={office.id} value={office.id}>
              {office.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-600">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Office Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => handleChange("location", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Contact Number</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Internal Notes</label>
        <textarea
          rows={5}
          value={form.note}
          onChange={(e) => handleChange("note", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl resize-none focus:ring-2 focus:ring-primary focus:outline-none"
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

        <div className="flex gap-3 mt-4 flex-wrap">
          {preview.map((img, i) => (
            <div key={i} className="relative">
              <Image
                src={img}
                alt="preview"
                width={120}
                height={120}
                className="rounded-lg object-contain h-32 w-32 bg-gray-200"
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

        <div className="flex justify-end gap-5 ">
          <button
            onClick={onClose}
            className="border-primary border-2 text-primary px-8 py-2 rounded-xl hover:bg-primary hover:text-white transition-colors duration-300 ease-in"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="bg-primary text-white px-8 py-2 rounded-xl hover:bg-primary/90 transition-all"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
