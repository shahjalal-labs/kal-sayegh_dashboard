"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";

import cloud from "@/assets/dashboard/cloud-upload.png";
import { useCreateClientMutation } from "@/redux/api/admin/estimateApi";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function EstimateDescription() {
  const [openClientModal, setOpenClientModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    clientName: "",
    city: "",
    state: "",
    zip: "",
    address: "",
    phoneNumber: "",
  });

  const [createClient, { isLoading }] = useCreateClientMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateClient = async (clientData: any) => {
    try {
      const response = await createClient(clientData).unwrap();

      toast.success("Client created successfully");

      setOpenClientModal(false);

      setFormData({
        email: "",
        clientName: "",
        city: "",
        state: "",
        zip: "",
        address: "",
        phoneNumber: "",
      });

      return response;
    } catch (error: any) {
      console.error("Error creating client:", error);

      toast.error(
        error?.data?.message || "Failed to create client. Please try again.",
      );
    }
  };
  return (
    <div className=" bg-gray-50 min-h-screen">
      <div className="flex  md:justify-between gap-3 mb-4">
        <Link
          href={"/admin/estimate"}
          className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} />
          <h2 className="text-lg font-normal hidden md:block">
            Back to Estimate
          </h2>
        </Link>
        <h2 className="text-lg md:text-2xl font-normal md:hidden block ">
          Add Estimate
        </h2>
        <div className="space-x-4 hidden md:block">
          <Link href={"/admin/estimate"}>
            <button className="px-6 py-2 border-[1px] border-primary text-primary hover:bg-primary transition-colors duration-300 hover:text-white rounded-xl ">
              Cancel
            </button>
          </Link>
          <button className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
            Submit Estimate
          </button>
        </div>
      </div>

      <div className="md:bg-secondary bg-none border-none md:border rounded-xl md:p-6 space-y-6">
        <div
          onClick={() => setOpenClientModal(true)}
          className="border border-dashed border-primary rounded-xl p-10 flex items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-50 duration-300"
        >
          <AiOutlineUserAdd className="mr-2 inline-block" size={20} />
          <span>Add Client</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Estimate#</label>
            <input
              placeholder="Estimate#"
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Date</label>
            <input
              type="date"
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Expiration Date</label>
            <input
              type="date"
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">PO Number</label>
            <input
              placeholder="PO Number"
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            rows={4}
            placeholder="Description"
            className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Side Map</label>
          <div className="mt-2 border border-dashed border-orange-300 rounded-xl p-10 flex flex-col items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-100/60 bg-orange-50 duration-300">
            <Image
              src={cloud}
              alt="cloud"
              width={40}
              height={40}
              className="mb-2"
            />
            Upload Side Map
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Legendary</label>
          <input
            placeholder="Legendary"
            className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Upload Image</label>
          <div className="mt-2 border border-dashed border-orange-300 rounded-xl p-10 flex flex-col items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-100/60 bg-orange-50 duration-300">
            <Image
              src={cloud}
              alt="cloud"
              width={40}
              height={40}
              className="mb-2"
            />
            Upload Image
          </div>
        </div>

        <button className="px-5 py-2 md:hidden rounded-lg bg-primary text-white hover:bg-primary/90 w-full transition-colors">
          Submit
        </button>
      </div>

      {openClientModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] md:w-[700px] p-6 rounded-xl shadow-lg space-y-4">
            <h2 className="text-lg font-semibold mb-4">Add Client</h2>
            <p className="text-base font-normal">Basic Information</p>

            {/* Client Name */}
            <div>
              <label className="text-sm">Client Name</label>
              <input
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Client Name"
                className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Email Address</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <p className="text-base font-normal">Address Information</p>

            {/* Address */}
            <div>
              <label className="text-sm">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* City + State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-sm">State</label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Zip */}
            <div>
              <label className="text-sm">Zip</label>
              <input
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="Zip"
                className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setOpenClientModal(false)}
                className="px-8 py-2 border rounded-xl hover:text-white hover:bg-primary transition-colors duration-300"
              >
                Cancel
              </button>

              <button
                onClick={() => handleCreateClient(formData)}
                className="px-8 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
