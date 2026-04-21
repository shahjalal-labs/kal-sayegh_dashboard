"use client";

import {
  useGetAllJobRequestsQuery,
  useGetJobRequestDetailsQuery,
  useGetOfficesQuery,
  useUpdateJobRequestMutation,
} from "@/redux/api/jobApi";
import { Calendar, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LiaEditSolid } from "react-icons/lia";
import { RiFolderDownloadLine } from "react-icons/ri";
import { CustomModal } from "../../modal/CustomModal";
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
  status: "NEW" | "REVIEWED";
}

interface Office {
  id: string;
  label: string;
  jobs: JobItem[];
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
    </div>
  );
}

export default function OfficeAdministration() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [updateJobRequest] = useUpdateJobRequestMutation();

  const { data } = useGetOfficesQuery({});
  const offices = data?.result || [];

  const { data: allJobsData, refetch: refetchAllJobs } =
    useGetAllJobRequestsQuery({});

  const allJobs =
    allJobsData?.result?.flatMap((office: any) =>
      office.jobRequests.map((job: any) => ({
        ...job,
        officeName: office.name,
        officeId: office.id,
      })),
    ) || [];

  console.log(allJobs);

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

        <div className="grid grid-cols-2 gap-4 md:gap-8">
          {offices?.map((office: any) => (
            <div key={office.id} className="space-y-4">
              <div className="flex items-center justify-between pb-4 gap-4">
                <h2 className="font-normal text-gray-800 bg-white shadow-md border md:pr-14 pl-3 px-2 py-1 md:py-3 text-sm md:text-base rounded-md md:rounded-xl ">
                  {office.name}
                </h2>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setOpenModal(true)}
                    className="px-2 py-1 md:px-4 md:py-3 bg-primary text-secondary text-xs md:text-base font-medium rounded-md md:rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <span>+ New Job Request</span>
                  </button>

                  <button className="p-1 md:p-3 rounded-lg shadow-lg bg-white text-gray-500 border">
                    <RiFolderDownloadLine size={25} />
                  </button>
                </div>
              </div>

              <div className="space-y-7 ">
                {allJobs.length > 0 ? (
                  allJobs.map((job: JobItem) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-1 md:py-6 md:px-4 bg-[#F7F8F8] border border-orange-100 rounded-2xl hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => handleJobClick(job)}
                    >
                      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            job.status === "NEW" ? "bg-red-500" : "bg-green-500"
                          }`}
                        />

                        <div>
                          <p className="text-sm md:text-lg font-medium text-gray-900">
                            {job.title}
                          </p>
                          <p className="text-xs md:text-base text-gray-500">
                            {new Date(job.date).toLocaleDateString()}
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
          ))}
        </div>
      </div>
    </div>
  );
}
