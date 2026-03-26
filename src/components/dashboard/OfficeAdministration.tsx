"use client";

import { LiaEditSolid } from "react-icons/lia";
import { RiFolderDownloadLine } from "react-icons/ri";

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
  return (
    <div className="min-h-screen bg-secondary p-6 rounded-2xl">
      <div className="">
        <div className=" rounded-lg p-6">
          <div className="grid grid-cols-2 gap-8">
            {offices.map((office) => (
              <div key={office.id} className="space-y-4">
                <div className="flex items-center justify-between pb-4 ">
                  <h2 className="text-lg font-normal text-gray-800 bg-[#FFFFFF] shadow-md border-[1px] pr-14 pl-3 py-3 rounded-xl">
                    {office.label}
                  </h2>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-3 bg-primary text-secondary text-base font-medium rounded-xl hover:bg-primary/90  transition-colors flex items-center gap-2">
                      <span>+ New Job Request</span>
                    </button>
                    <button className="p-3 rounded-lg  transition-colors shadow-lg bg-[#FFFFFF] text-gray-500 border-[1px] ">
                      <RiFolderDownloadLine size={25} />
                    </button>
                  </div>
                </div>

                <div className="space-y-7 ">
                  {office.jobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between py-6
                       px-4 hover:bg-gray-50 rounded-2xl transition-colors bg-[#F7F8F8] border-orange-100 border"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            job.status === "NEW" ? "bg-red-500" : "bg-green-500"
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 text-pretty">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-500">{job.date}</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-end">
                        <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                          <LiaEditSolid size={25} />
                        </button>
                        <div
                          className={`px-4 py-2 rounded-lg text-white text-xs font-normal flex-shrink-0 mt-1 ${
                            job.status === "NEW" ? "bg-red-500" : "bg-green-500"
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
      </div>
    </div>
  );
}
