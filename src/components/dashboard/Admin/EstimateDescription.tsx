"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";

import cloud from "@/assets/dashboard/cloud-upload.png";
import { CustomModal } from "@/components/modal/CustomModal";
import {
  DepositModalContent,
  DiscountModalContent,
  MarkupModalContent,
} from "@/components/modal/PopUp";
import {
  useCreateClientMutation,
  useCreateEstimateMutation,
  useGetMyClientsQuery,
} from "@/redux/api/admin/estimateApi";
import Image from "next/image";
import { useState } from "react";
import { LuMapPin } from "react-icons/lu";
import { toast } from "sonner";

export default function EstimateDescription() {
  const [open, setOpen] = useState(false);

  const [openClientModal, setOpenClientModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    clientName: "",
    city: "",
    state: "",
    zip: "",
    address: "",
    phoneNumber: "",
  });

  const [estimateForm, setEstimateForm] = useState({
    estimateName: "",
    clientId: "",
    date: "",
    endDate: "",
    items: [] as any[],
    additionalMarkUp: 0,
    grandTotal: 0,
    discountAmount: 0,
    depositAmount: 0,
  });

  const [markup, setMarkup] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number | null>(null);
  const [deposit, setDeposit] = useState<number | null>(null);
  const [modalType, setModalType] = useState<
    "markup" | "discount" | "deposit" | null
  >(null);
  const [tempValue, setTempValue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [createClient, { isLoading }] = useCreateClientMutation();
  const [createEstimate] = useCreateEstimateMutation();

  const { data } = useGetMyClientsQuery({});
  const myClients = data?.result;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOpenModal = (type: "markup" | "discount" | "deposit") => {
    setModalType(type);
    setTempValue(0);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (modalType === "markup") setMarkup(tempValue);
    if (modalType === "discount") setDiscount(tempValue);
    if (modalType === "deposit") setDeposit(tempValue);

    setIsModalOpen(false);
  };

  const getModalActions = () => {
    switch (modalType) {
      case "markup":
        return [
          {
            label: "Cancel",
            onClick: () => setIsModalOpen(false),
            variant: "secondary" as const,
          },
          {
            label: "Done",
            onClick: handleSave,
            variant: "primary" as const,
          },
        ];

      case "discount":
        return [
          {
            label: "Cancel",
            onClick: () => setIsModalOpen(false),
            variant: "secondary" as const,
          },
          {
            label: "Add",
            onClick: handleSave,
            variant: "primary" as const,
          },
        ];

      case "deposit":
        return [
          {
            label: "Cancel",
            onClick: () => setIsModalOpen(false),
            variant: "secondary" as const,
          },
          {
            label: "Add",
            onClick: handleSave,
            variant: "primary" as const,
          },
        ];

      default:
        return [];
    }
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

  const handleCreateEstimate = async () => {
    try {
      const bodyData = {
        estimateName: estimateForm.estimateName,
        clientId: estimateForm.clientId,
        date: estimateForm.date,
        endDate: estimateForm.endDate,
        items: estimateForm.items.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          subTotal: item.subTotal,
        })),
        additionalMarkUp: Number(estimateForm.additionalMarkUp),
        grandTotal: Number(estimateForm.grandTotal),
        discountAmount: Number(estimateForm.discountAmount),
        depositAmount: Number(estimateForm.depositAmount),
      };

      const res = await createEstimate(bodyData).unwrap();

      console.log("Success:", res);
      toast.success("Estimate created successfully");
    } catch (err: any) {
      console.log(err);
      toast.error(err?.data?.message || "Failed to create estimate");
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
          <button
            onClick={handleCreateEstimate}
            className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
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

        <div>
          {/* Button */}
          <button
            onClick={() => setOpen(true)}
            className="border-primary border rounded-xl px-6 py-2 text-primary hover:bg-primary hover:text-white transition"
          >
            {selectedClient ? selectedClient.clientName : "View All Client"}
          </button>

          {/* Modal */}
          {open && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <div className="bg-white w-[90%] md:w-[600px] max-h-[80vh] rounded-2xl shadow-xl flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-lg font-semibold">Select Client</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="text-gray-500 hover:text-red-500 text-xl"
                  >
                    ✕
                  </button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto space-y-3">
                  {myClients.length > 0 ? (
                    myClients.map((client: any) => (
                      <div
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setOpen(false);
                        }}
                        className={`p-4 border rounded-xl cursor-pointer transition shadow-sm
                  ${
                    selectedClient?.id === client.id
                      ? "bg-primary text-white border-primary"
                      : "hover:bg-orange-50"
                  }`}
                      >
                        <p className="font-semibold text-base">
                          {client.clientName}
                        </p>

                        <p className="text-sm opacity-80">{client.email}</p>

                        <p className="text-xs opacity-70 flex gap-2 items-center">
                          <LuMapPin /> {client.address || "No address"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center">
                      No clients found
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t text-right">
                  <button
                    onClick={() => setOpen(false)}
                    className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showAll && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[90%] md:w-[500px] max-h-[80vh] rounded-2xl p-5 shadow-xl flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">All Clients</h2>
                <button
                  onClick={() => setShowAll(false)}
                  className="text-gray-500 hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Client List */}
              <div className="overflow-y-auto space-y-2 pr-2">
                {myClients?.length > 0 ? (
                  myClients.map((client: any) => (
                    <div
                      key={client.id}
                      className="p-3 border rounded-lg hover:bg-orange-50 cursor-pointer transition"
                    >
                      <p className="font-medium">{client.clientName}</p>
                      <p className="text-sm text-gray-500">{client.email}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400">No clients found</p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 text-right">
                <button
                  onClick={() => setShowAll(false)}
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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

        {/* <div>
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            rows={4}
            placeholder="Description"
            className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
          />
        </div> */}

        <div className="w-full">
          <button className="w-full border border-primary text-primary rounded-xl py-2 text-left p-2">
            + Add Line Item
          </button>
        </div>

        <div>
          <label className="text-base font-normal">Side Map</label>
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
          <label className="text-base font-normal">Upload Image</label>
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

        <div className="mt-6 flex justify-end">
          <div className="w-[356px] flex flex-col space-y-3">
            <div className="flex justify-between items-center border-b py-1">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="font-semibold text-gray-900">0</span>
            </div>

            {/* Markup */}
            <div className="flex justify-between items-center  border-b py-1">
              <span className="text-gray-700 font-medium">Markup</span>

              {markup !== null ? (
                <span
                  className="font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleOpenModal("markup")}
                >
                  {markup}%
                </span>
              ) : (
                <button
                  onClick={() => handleOpenModal("markup")}
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Add
                </button>
              )}
            </div>

            <div className="flex justify-between items-center  border-b py-1">
              <span className="text-gray-700 font-medium">Discount</span>

              {discount !== null ? (
                <span
                  className="font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleOpenModal("discount")}
                >
                  {discount}%
                </span>
              ) : (
                <button
                  onClick={() => handleOpenModal("discount")}
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Add
                </button>
              )}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">
                Request a deposit
              </span>

              {deposit !== null ? (
                <span
                  className="font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleOpenModal("deposit")}
                >
                  {deposit}%
                </span>
              ) : (
                <button
                  onClick={() => handleOpenModal("deposit")}
                  className="text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Add
                </button>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-gray-300 pt-3">
              <span className="text-gray-900 font-bold text-lg">
                Total(USD)
              </span>
              <span className="text-orange-500 font-bold text-lg">0</span>
            </div>

            <button className="px-5 py-2 md:hidden rounded-lg bg-primary text-white hover:bg-primary/90 w-full transition-colors">
              Submit
            </button>

            <CustomModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              maxWidth="sm"
              actions={getModalActions()}
            >
              {modalType === "markup" && (
                <MarkupModalContent value={tempValue} setValue={setTempValue} />
              )}

              {modalType === "discount" && (
                <DiscountModalContent
                  value={tempValue}
                  setValue={setTempValue}
                />
              )}

              {modalType === "deposit" && (
                <DepositModalContent
                  value={tempValue}
                  setValue={setTempValue}
                />
              )}
            </CustomModal>
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
