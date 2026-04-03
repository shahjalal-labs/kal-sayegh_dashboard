"use client";

import { Calendar, Mail, MapPin, Phone, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LiaEditSolid } from "react-icons/lia";
import { RiFolderDownloadLine } from "react-icons/ri";
import { CustomModal } from "../../modal/CustomModal";

interface FormData {
  office: string;
  date: string;
  location: string;
  phone: string;
  email: string;
  address: string;
}

interface JobItem {
  id: number;
  title: string;
  date: string;
  status: "NEW" | "REVIEWED";
}

interface Office {
  id: string;
  label: string;
  jobs: JobItem[];
}

function CreateJobForm({
  form,
  setForm,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm text-gray-600">Office Name</label>
        <select
          value={form.office}
          onChange={(e) => handleChange("office", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        >
          <option value="">Select Office</option>
          <option>Office 01</option>
          <option>Office 02</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-gray-600">Date</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => handleChange("date", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Office Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => handleChange("location", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Contact Number</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>

      <div>
        <label className="text-sm text-gray-600">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          className="w-full mt-1 border px-4 py-3 rounded-xl"
        />
      </div>
    </div>
  );
}

function CreateNewJobForm({ form, setForm }: any) {
  const [images, setImages] = useState<string[]>([]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file),
    );

    setImages((prev) => [...prev, ...newImages]);
  };
  return (
    <div className="space-y-5 text-base">
      {[
        { icon: Calendar, label: "Date :", value: "Monday, March 2, 2026" },
        { icon: Phone, label: "Contact :", value: "(555) 234-5678" },
        { icon: Mail, label: "Email", value: "im@email.com" },
        {
          icon: MapPin,
          label: "Job Address",
          value: "4517 Washington Ave. Manchester, Kentucky 39495",
          long: true,
        },
      ].map((item, i) => (
        <div
          key={i}
          className="flex justify-between items-start border-b border-dashed border-gray-300 pb-3"
        >
          <div className="flex items-center gap-2 text-gray-500">
            <item.icon size={16} />
            {item.label}
          </div>

          <span
            className={`${
              item.long ? "text-right max-w-[60%]  text-base" : ""
            } font-medium`}
          >
            {item.value}
          </span>
        </div>
      ))}

      <div>
        <label className="block mb-2 font-semibold text-lg">
          Internal Notes
        </label>

        <textarea
          placeholder="e.g. Spoke to client, sending estimate tomorrow"
          className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
          rows={3}
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold text-lg">
          Upload Picture
        </label>

        <input
          type="file"
          accept="image/*"
          multiple
          id="upload"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <label
          htmlFor="upload"
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition"
        >
          <Upload className="text-gray-400 mb-2" size={22} />

          <div className="flex items-center gap-1">
            <span className="text-primary font-medium">Upload</span>
            <span>Picture</span>
          </div>

          <p className="text-xs text-gray-400 mt-1">Supports: JPG, PNG</p>
        </label>

        <div className="flex gap-3 mt-3 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative">
              <Image
                src={img}
                alt="preview"
                width={200}
                height={200}
                className="rounded-md object-cover"
              />

              <button
                onClick={() =>
                  setImages((prev) => prev.filter((_, index) => index !== i))
                }
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const offices: Office[] = [
  {
    id: "01",
    label: "Office 01",
    jobs: [
      {
        id: 1,
        title: "Kitchen Remodel - Johnson Residence",
        date: "Mar 2, 2026",
        status: "NEW",
      },
      {
        id: 2,
        title: "Bathroom Addition - Williams Home",
        date: "Mar 2, 2026",
        status: "NEW",
      },
      {
        id: 3,
        title: "Roof Repair - Elm St Office",
        date: "Mar 2, 2026",
        status: "REVIEWED",
      },
      {
        id: 4,
        title: "Deck Build - Harbor View",
        date: "Mar 2, 2026",
        status: "REVIEWED",
      },
    ],
  },
  {
    id: "02",
    label: "Office 02",
    jobs: [
      {
        id: 5,
        title: "Kitchen Remodel - Johnson Residence",
        date: "Mar 2, 2026",
        status: "NEW",
      },
      {
        id: 6,
        title: "Bathroom Addition - Williams Home",
        date: "Mar 2, 2026",
        status: "NEW",
      },
      {
        id: 7,
        title: "Roof Repair - Elm St Office",
        date: "Mar 2, 2026",
        status: "REVIEWED",
      },
      {
        id: 8,
        title: "Deck Build - Harbor View",
        date: "Mar 2, 2026",
        status: "REVIEWED",
      },
    ],
  },
  {
    id: "03",
    label: "Office 03",
    jobs: [
      {
        id: 9,
        title: "Kitchen Remodel - Johnson Residence",
        date: "Mar 2, 2026",
        status: "NEW",
      },
      {
        id: 10,
        title: "Bathroom Addition - Williams Home",
        date: "Mar 2, 2026",
        status: "NEW",
      },
      {
        id: 11,
        title: "Roof Repair - Elm St Office",
        date: "Mar 2, 2026",
        status: "REVIEWED",
      },
      {
        id: 12,
        title: "Deck Build - Harbor View",
        date: "Mar 2, 2026",
        status: "REVIEWED",
      },
    ],
  },
  {
    id: "04",
    label: "Office 04",
    jobs: [
      {
        id: 13,
        title: "Kitchen Remodel - Johnson Residence",
        date: "Mar 2, 2026",
        status: "NEW",
      },
      {
        id: 14,
        title: "Bathroom Addition - Williams Home",
        date: "Mar 2, 2026",
        status: "NEW",
      },
      {
        id: 15,
        title: "Roof Repair - Elm St Office",
        date: "Mar 2, 2026",
        status: "REVIEWED",
      },
      {
        id: 16,
        title: "Deck Build - Harbor View",
        date: "Mar 2, 2026",
        status: "REVIEWED",
      },
    ],
  },
];

export default function OfficeAdministration() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState<FormData>({
    office: "",
    date: "",
    location: "",
    phone: "",
    email: "",
    address: "",
  });

  const initialForm: FormData = {
    office: "",
    date: "",
    location: "",
    phone: "",
    email: "",
    address: "",
  };

  useEffect(() => {
    if (selectedJob) {
      setForm({
        office: "Office 01",
        date: selectedJob.date,
        location: "Sample Location",
        phone: "123456789",
        email: "test@gmail.com",
        address: "Sample Address",
      });
    } else {
      setForm(initialForm);
    }
  }, [selectedJob]);

  const handleSubmit = () => {
    if (selectedJob) {
      console.log("UPDATED:", form);
    } else {
      console.log("CREATED:", form);
    }

    setOpenModal(false);
    setSelectedJob(null);
  };

  const handleNewJob = () => {
    console.log("new");
  };

  return (
    <div className=" bg-secondary p-6 rounded-2xl">
      <CustomModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedJob(null);
        }}
        title={selectedJob ? "Edit Job Request" : "Create New Job Request"}
        actions={[
          {
            label: "Close",
            variant: "secondary",
            onClick: () => {
              setOpenModal(false);
              setSelectedJob(null);
            },
          },
          {
            label: selectedJob ? "Save Changes" : "Submit",
            variant: "primary",
            onClick: handleSubmit,
          },
        ]}
      >
        <CreateJobForm form={form} setForm={setForm} />
      </CustomModal>

      <CustomModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Roof Repair – Elm St Office"
        actions={[
          {
            label: "Close",
            variant: "secondary",
            onClick: () => setIsOpen(false),
          },
          {
            label: "Create New Estimate",
            variant: "secondary",
            onClick: handleNewJob,
          },
          {
            label: "Mark as Reviewed",
            variant: "primary",
            onClick: () => {
              console.log("Marked as reviewed:", form);
            },
          },
        ]}
      >
        <CreateNewJobForm form={form} setForm={setForm} />
      </CustomModal>

      <div className="grid md:grid-cols-2 gap-8">
        {offices.map((office) => (
          <div key={office.id} className="space-y-4">
            <div className="flex items-center justify-between pb-4 gap-4">
              <h2 className="font-normal text-gray-800 bg-white shadow-md border md:pr-14 pl-3 px-2 py-1 md:py-3 text-base rounded-md md:rounded-xl ">
                {office.label}
              </h2>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setOpenModal(true)}
                  className="px-3 py-2 md:px-4 md:py-3 bg-primary text-secondary text-xs md:text-base font-medium rounded-md md:rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <span>+ New Job Request</span>
                </button>

                <button className="p-1 md:p-3 rounded-lg shadow-lg bg-white text-gray-500 border">
                  <RiFolderDownloadLine size={25} />
                </button>
              </div>
            </div>

            <div className="space-y-7">
              {office.jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between py-6 px-4 bg-[#F7F8F8] border border-orange-100 rounded-2xl hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        job.status === "NEW" ? "bg-red-500" : "bg-green-500"
                      }`}
                    />

                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {job.title}
                      </p>
                      <p className="text-xs text-gray-500">{job.date}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setOpenModal(true);
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <LiaEditSolid size={25} />
                    </button>

                    <div
                      onClick={() => {
                        if (job.status === "NEW") {
                          setSelectedJob(job);
                          setIsOpen(true);
                        }
                      }}
                      className={`px-4 py-2 mt-1 rounded-lg text-white text-xs cursor-pointer ${
                        job.status === "NEW"
                          ? "bg-[#D40C1A] hover:bg-red-600"
                          : "bg-green-500 cursor-not-allowed"
                      }`}
                    >
                      {job.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
