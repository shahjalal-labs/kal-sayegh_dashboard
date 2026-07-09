"use client";

import {
  useGetAllJobRequestsQuery,
  useGetJobRequestDetailsQuery,
  useGetOfficesQuery,
  useJobRequestByImageMutation,
  useUpdateJobRequestMutation,
} from "@/redux/api/jobApi";
import { Calendar, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LiaEditSolid } from "react-icons/lia";
import { RiFolderDownloadLine } from "react-icons/ri";
import { toast } from "sonner";
import { CustomModal } from "../../modal/CustomModal";
import { ImageUploadArea } from "../../ui/ImageUploadArea";
import CreateJobForm from "../CreateJobForm";
import CreateOffice from "../CreateOffice";
import EditJobForm from "../EditJobForm";

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

interface JobItem {
  id: number;
  title: string;
  date: string;
  status: string;
  jobSerial: string;
}

function CreateNewJobForm({ form, setForm, jobRequestId }: any) {
  const [images, setImages] = useState<string[]>([]);
  const { data, isLoading } = useGetJobRequestDetailsQuery(jobRequestId, {
    skip: !jobRequestId,
  });
  const jobDetails = data?.result;
  const jobImages = Array.isArray(jobDetails?.images) ? jobDetails.images : [];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    {
    }
    const newImages = Array.from(files).map((file) =>
      URL.createObjectURL(file),
    );

    setImages((prev) => [...prev, ...newImages]);
  };
  return (
    <div>
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded-md" />
          <div className="space-y-4 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center border-b border-dashed border-gray-200 pb-3">
                <div className="h-4 w-24 bg-gray-200 rounded-md" />
                <div className="h-4 w-32 bg-gray-200 rounded-md" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 md:h-32 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      ) : (
      <>
      <h2 className="text-xl font-semibold">{jobDetails?.title}</h2>
      <div className="space-y-5 text-base mt-4">
        {[
          {
            icon: Calendar,
            label: "Date :",
            value: jobDetails?.date
              ? new Date(jobDetails.date).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "N/A",
          },
          { icon: Phone, label: "Contact :", value: jobDetails?.contact },
          { icon: Mail, label: "Email", value: jobDetails?.email },
          {
            icon: MapPin,
            label: "Job Address",
            value: jobDetails?.address,
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

        <div className="space-y-3">
          {jobImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {jobImages.map((imageUrl: string, index: number) => (
                <Image
                  key={`${imageUrl}-${index}`}
                  src={imageUrl}
                  alt={`Job image ${index + 1}`}
                  width={180}
                  height={140}
                  className="w-full h-28 md:h-32 object-cover rounded-lg bg-gray-200"
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No images available.</p>
          )}

          <p>{jobDetails?.note}</p>
        </div>
      </div>
      </>
      )} {/* end isLoading */}
    </div>
  );
}

export default function OfficeAdministration() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [jobFormOpen, setJobFormOpen] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [updateJobRequest] = useUpdateJobRequestMutation();
  const [jobRequestByImage] = useJobRequestByImageMutation();

  const { data, isLoading: officesLoading } = useGetOfficesQuery({});
  const offices = data?.result || [];

  const {
    data: allJobsData,
    isLoading: jobsLoading,
    refetch: refetchAllJobs,
  } = useGetAllJobRequestsQuery({});

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

  const [jobFormByImage, setFormByImage] = useState({
    title: "",
    date: "",
    officeId: "",
  });

  const [preview, setPreview] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    setSelectedFiles(files);

    const imageUrls = files.map((file) => URL.createObjectURL(file));

    setPreview((prev) => [...prev, ...imageUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewJob = () => {
    setIsOpen(false);
    router.push("/admin/estimate");
  };

  const handleJobClick = (job: JobItem) => {
    if (job.status === "NEW") {
      setSelectedJob(job);
      setIsOpen(true);
    }
  };

  const handleMarkAsReviewed = async () => {
    if (!selectedJob?.id || selectedJob?.status !== "NEW") return;

    try {
      const formData = new FormData();
      formData.append("bodyData", JSON.stringify({ status: "REVIEWED" }));

      await updateJobRequest({
        jobRequestId: selectedJob.id,
        data: formData,
      }).unwrap();

      setSelectedJob((prev: any) =>
        prev ? { ...prev, status: "REVIEWED" } : prev,
      );
      setIsOpen(false);
      await refetchAllJobs();
    } catch (error) {
      console.error("Failed to mark job as reviewed", error);
    }
  };

  const handleJobByImage = async () => {
    try {
      // basic validation
      const title = jobFormByImage.title?.trim() || "";
      if (title.length < 2) {
        toast.error("Title must be at least 2 characters");
        return;
      }

      // normalize date to full ISO datetime expected by backend
      let dateIso = jobFormByImage.date || "";
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) {
        dateIso = new Date(dateIso + "T10:00:00Z").toISOString();
      } else {
        const parsed = new Date(dateIso);
        if (isNaN(parsed.getTime())) {
          toast.error("Please provide a valid date");
          return;
        }
        dateIso = parsed.toISOString();
      }

      const formData = new FormData();
      formData.append(
        "bodyData",
        JSON.stringify({
          title,
          date: dateIso,
          officeId: jobFormByImage.officeId,
        }),
      );

      selectedFiles.forEach((file) => {
        formData.append("jobRequestsImage", file);
      });

      const res = await jobRequestByImage(formData).unwrap();

      console.log(res);

      setJobFormOpen(false);

      setFormByImage({
        title: "",
        date: "",
        officeId: "",
      });

      setPreview([]);
      setSelectedFiles([]);
    } catch (error) {
      toast.error("Failed to create job request by image.");
    }
  };

  const getOfficeJobs = (officeId: string) => {
    const matchedOffice = allJobsData?.result?.find(
      (office: any) => office.id === officeId,
    );

    if (Array.isArray(matchedOffice?.jobRequests)) {
      return matchedOffice.jobRequests;
    }

    return [];
  };

  // ── skeleton helpers ──────────────────────────────────────────────────────
  const SkeletonPulse = ({ className = "" }: { className?: string }) => (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
    />
  );

  const JobCardSkeleton = () => (
    <div className="flex items-center justify-between md:py-6 md:px-4 bg-[#F7F8F8] border border-orange-100 rounded-2xl p-2">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-1">
        <div className="w-3 h-3 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonPulse className="h-3 w-20" />
          <SkeletonPulse className="h-5 w-44" />
          <SkeletonPulse className="h-3 w-28" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-3">
        <SkeletonPulse className="h-5 w-5 rounded" />
        <SkeletonPulse className="h-7 w-16 rounded-lg" />
      </div>
    </div>
  );

  const OfficeSectionSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 gap-4">
        <SkeletonPulse className="h-10 w-40 md:w-52 rounded-xl" />
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-10 w-28 md:w-36 rounded-xl" />
          <SkeletonPulse className="h-10 w-10 rounded-lg" />
        </div>
      </div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <JobCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <CreateOffice />
      <div className=" bg-secondary p-6 rounded-2xl">
        <CustomModal
          open={openModal}
          onClose={() => {
            setOpenModal(false);
          }}
          title={"Create New Job Request"}
        >
          <CreateJobForm
            onClose={() => {
              setOpenModal(false);
            }}
          />
        </CustomModal>

        <CustomModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          title="Edit Job Request"
        >
          {selectedJob && (
            <EditJobForm
              selectedJob={selectedJob}
              onClose={() => setOpenEditModal(false)}
            />
          )}
        </CustomModal>

        <CustomModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title=""
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
              onClick: handleMarkAsReviewed,
            },
          ]}
        >
          <CreateNewJobForm
            form={form}
            setForm={setForm}
            jobRequestId={selectedJob?.id}
          />
        </CustomModal>

        {/* Job Request Modal */}

        <CustomModal
          open={jobFormOpen}
          onClose={() => setJobFormOpen(false)}
          title="Create New Job Request"
        >
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-sm text-gray-600">Title</label>

              <input
                type="text"
                value={jobFormByImage.title}
                placeholder="Title"
                onChange={(e) =>
                  setFormByImage((prev) => ({ ...prev, title: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Date */}
            <div>
              <label className="text-sm text-gray-600">Date</label>

              <input
                type="date"
                value={jobFormByImage.date}
                onChange={(e) =>
                  setFormByImage((prev) => ({ ...prev, date: e.target.value }))
                }
                className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Office Id */}
            <div>
              <label className="text-sm text-gray-600">Office Id</label>

              <input
                type="text"
                value={jobFormByImage.officeId}
                placeholder="Office Id"
                onChange={(e) =>
                  setFormByImage((prev) => ({
                    ...prev,
                    officeId: e.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Upload Images */}
            <div>
              <label className="text-sm text-gray-600">Upload Images</label>

              <ImageUploadArea
                onFiles={(files) => {
                  setSelectedFiles((prev) => [...prev, ...files]);
                  const urls = files.map((f) => URL.createObjectURL(f));
                  setPreview((prev) => [...prev, ...urls]);
                }}
              />

              {/* Preview */}
              <div className="mt-4 flex flex-wrap gap-3">
                {preview.map((img, i) => (
                  <div key={i} className="relative">
                    <Image
                      src={img}
                      alt="preview"
                      width={120}
                      height={120}
                      className="h-32 w-32 rounded-lg bg-gray-200 object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(i)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 text-xs text-white"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-5 pt-4">
              <button
                type="button"
                onClick={() => setJobFormOpen(false)}
                className="rounded-xl border-2 border-primary px-8 py-2 text-primary transition-colors duration-300 hover:bg-primary hover:text-white"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleJobByImage}
                className="rounded-xl bg-primary px-8 py-2 text-white transition-all hover:bg-primary/90"
              >
                Submit
              </button>
            </div>
          </div>
        </CustomModal>

        {/* ── Office grid with inline shimmer style ── */}
        <style>{`
          @keyframes shimmer {
            0%   { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        {officesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <OfficeSectionSkeleton key={i} />
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4  md:gap-8">
          {offices?.map((office: any) => {
            const officeJobs = getOfficeJobs(office.id);

            return (
              <div key={office.id} className="space-y-4">
                <div className="flex items-center justify-between pb-4 gap-4 ">
                  <h2 className="font-normal text-gray-800 bg-white shadow-md border md:pr-14 pl-3 px-2 py-1 md:py-3 text-sm md:text-base rounded-md md:rounded-xl ">
                    {office.name}
                  </h2>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setOpenModal(true)}
                      className="p-2 md:px-4 md:py-3 bg-primary text-secondary text-xs md:text-base font-medium rounded-md md:rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                    >
                      <span>+ New Job Request</span>
                    </button>

                    <button
                      onClick={() => {
                        setJobFormOpen(true);
                        setFormByImage((prev) => ({
                          ...prev,
                          officeId: office.id,
                        }));

                        setPreview([]);
                        setSelectedFiles([]);
                      }}
                      className="p-1 md:p-3 rounded-lg shadow-lg bg-white text-gray-500 border"
                    >
                      <RiFolderDownloadLine size={25} />
                    </button>
                  </div>
                </div>

                <div className="space-y-7 ">
                  {jobsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <JobCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : officeJobs.length > 0 ? (
                    officeJobs.map((job: JobItem) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between md:py-6 md:px-4 bg-[#F7F8F8] border border-orange-100 rounded-2xl hover:bg-gray-50 transition cursor-pointer p-2"
                        onClick={() => handleJobClick(job)}
                      >
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-1">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              job.status === "NEW"
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                          />

                          <div>
                            <p className="text-base font-semibold">
                              SL No:{" "}
                              <span className="font-normal">
                                {job?.jobSerial}
                              </span>
                            </p>
                            <p className="text-sm md:text-lg font-medium text-gray-900">
                              {job.title}
                            </p>
                            <p className="text-xs md:text-base text-gray-500">
                              {new Date(job.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex-col items-end gap-3 flex">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedJob(job);
                              setOpenEditModal(true);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <LiaEditSolid size={25} />
                          </button>

                          <div
                            className={`px-4 py-2 mt-1 rounded-lg text-white text-xs ${
                              job.status === "NEW"
                                ? "bg-[#D40C1A] hover:bg-red-600 cursor-pointer"
                                : "bg-green-500 cursor-not-allowed"
                            }`}
                          >
                            {job.status}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 px-4 bg-[#F7F8F8] border border-orange-100 rounded-2xl text-center text-gray-500">
                      No job requests found.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        )} {/* end officesLoading */}
      </div>
    </div>
  );
}
