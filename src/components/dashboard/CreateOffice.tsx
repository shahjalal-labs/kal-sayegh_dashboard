"use client";

import { useCreateOfficeMutation } from "@/redux/api/jobApi";
import { useState } from "react";
import { toast } from "sonner";
import { CustomModal } from "../modal/CustomModal";

export default function CreateOffice() {
  const [openOfficeModal, setOpenOfficeModal] = useState(false);

  const [officeData, setOfficeData] = useState({
    name: "",
    address: "",
  });

  const [createOffice, { isLoading }] = useCreateOfficeMutation();

  const handleCreateOffice = async () => {
    try {
      await createOffice({
        name: officeData.name,
        address: officeData.address,
      }).unwrap();

      toast.success("Office created successfully!");
      setOpenOfficeModal(false);

      setOfficeData({
        name: "",
        address: "",
      });
    } catch (err: any) {
      toast.error("Failed to create office", err);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-10">
        <button
          type="submit"
          onClick={() => setOpenOfficeModal(true)}
          className=" px-3 py-2 md:px-4 md:py-3 bg-primary text-secondary text-xs md:text-base font-medium rounded-md md:rounded-xl hover:bg-primary/90 "
        >
          + Create New Office
        </button>
      </div>
      <CustomModal
        open={openOfficeModal}
        onClose={() => setOpenOfficeModal(false)}
        title="Create New Office"
        maxWidth="md"
        actions={[
          {
            label: "Cancel",
            onClick: () => setOpenOfficeModal(false),
            variant: "secondary",
          },
          {
            label: "Create",
            onClick: handleCreateOffice,
            variant: "primary",
          },
        ]}
      >
        <div className="space-y-5">
          {/* Office Name */}
          <div>
            <label className="text-sm text-gray-600">Office Name</label>
            <input
              type="text"
              placeholder="Office Name"
              value={officeData.name}
              onChange={(e) =>
                setOfficeData((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full mt-1 border px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Address</label>
            <input
              type="text"
              placeholder="Office Address"
              value={officeData.address}
              onChange={(e) =>
                setOfficeData((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              className="w-full mt-1 border px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
