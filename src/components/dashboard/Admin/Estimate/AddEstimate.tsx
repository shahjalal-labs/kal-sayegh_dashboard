"use client";

import { ImageUploadArea } from "@/components/ui/ImageUploadArea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";

import ContractModal from "@/components/modal/ContractModal";
import CommonTable from "@/components/table/CommonTable";
import Summary from "@/components/table/summary";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { useGetAllContractsQuery } from "@/redux/api/admin/contractApi";
import {
  useCreateClientMutation,
  useCreateEstimateMutation,
  useGetMyClientsQuery,
} from "@/redux/api/admin/estimateApi";
import { FormatType, LineItemTable } from "@/types/estimate.type";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LuMapPin } from "react-icons/lu";
import { toast } from "sonner";

export default function AddEstimate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [sideMap, setSideMap] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [openClientModal, setOpenClientModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const sideMapRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const [selectedMarkup, setSelectedMarkup] = useState<any>(null);
  const [addContractModalOpen, setAddContractModalOpen] = useState(false);
  const [tableData, setTableData] = useState<any>(null);
  const [tableKey, setTableKey] = useState(0);

  const [estimateForm, setEstimateForm] = useState({
    additionalMarkUp: 0,
    clientId: "",
    clientSign: false,
    contractId: "",
    coverPaymentProcessingFee: false,
    date: "",
    depositAmount: 0,
    discountAmount: 0,
    endDate: "",
    estimateName: "",
    estimateNumber: "",
    format: "" as FormatType | "",
    grandTotal: 0,
    isAutoInvoice: false,
    isGroupingEnabled: false,
    isOnlinePayment: false,
    items: [] as LineItemTable[],
    legendary: "",
    mySign: false,
    noteForClient: "",
    poNumber: "",
    privateNote: "",
  });

  useEffect(() => {
    try {
      const param = searchParams?.get("format") || "";
      let normalized = String(param).toUpperCase();

      if (!normalized) {
        const fromStorage =
          typeof window !== "undefined"
            ? localStorage.getItem("estimateDetailsFormat")
            : null;
        if (fromStorage) {
          const s = String(fromStorage).toUpperCase();
          if (s === "TABLE" || s === "DESCRIPTION" || s === "IMAGE_PDF") {
            normalized = s;
          }
        }
      }

      if (
        normalized === "TABLE" ||
        normalized === "DESCRIPTION" ||
        normalized === "IMAGE_PDF"
      ) {
        setEstimateForm((prev) => ({
          ...prev,
          format: normalized as FormatType,
        }));
      }
    } catch (e) {
      // ignore
    }
  }, [searchParams]);

  const [lineItemTables, setLineItemTables] = useState<LineItemTable[]>([]);

  const [discount, setDiscount] = useState<number | null>(null);
  const [deposit, setDeposit] = useState<number | null>(null);

  const grandSubtotal = lineItemTables.reduce((acc, table) => {
    return (
      acc +
      table.items.reduce((tAcc, item) => {
        return tAcc + (Number(item?.total) || 0);
      }, 0)
    );
  }, 0);

  const calculateFinalTotal = () => {
    if (tableData?.grandTotal) return tableData.grandTotal;

    let total = grandSubtotal;

    if (
      estimateForm.additionalMarkUp &&
      Number(estimateForm.additionalMarkUp) !== 0
    ) {
      total += (total * Number(estimateForm.additionalMarkUp)) / 100;
    } else if (selectedMarkup?.percentage) {
      total += (total * selectedMarkup.percentage) / 100;
    }

    if (discount) {
      total -= (total * discount) / 100;
    }

    if (deposit) {
      total -= (total * deposit) / 100;
    }

    return total;
  };

  const handleCommonTableChange = (data: any) => {
    try {
      setTableData(data);
      if (data?.summaryMarkup) setSelectedMarkup(data.summaryMarkup);
      else setSelectedMarkup(null);

      if (data?.summaryDiscount)
        setDiscount(data.summaryDiscount.value ?? null);
      else setDiscount(null);

      if (data?.summaryDeposit) setDeposit(data.summaryDeposit.value ?? null);
      else setDeposit(null);
    } catch (e) {
      console.error("Failed to sync common table data", e);
    }
  };

  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    serviceAddress: "",
    serviceCity: "",
    serviceState: "",
    serviceZip: "",
  });

  const [isServiceAddressDifferent, setIsServiceAddressDifferent] = useState(false);

  const [createClient] = useCreateClientMutation();
  const [createEstimate] = useCreateEstimateMutation();

  const { data } = useGetMyClientsQuery({});
  const myClients = data?.result;

  const { data: contractData } = useGetAllContractsQuery({});
  const contracts = contractData?.result?.data ?? [];
  const selectedContractTitle =
    contracts.find((c: any) => c.id === estimateForm.contractId)?.title ?? "";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSideMapFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setSideMap(Array.from(fileList)[0]);
  };

  const removeSideMap = () => {
    setSideMap(null);
  };

  const handleImageFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setImages((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateClient = async (clientData: any) => {
    try {
      if (isServiceAddressDifferent) {
        if (!clientData.serviceAddress || !clientData.serviceCity || !clientData.serviceState || !clientData.serviceZip) {
          toast.error("Please fill in all Service Address fields.");
          return;
        }
      }

      const payload: any = {
        email: clientData.email,
        clientName: clientData.clientName,
        city: clientData.city,
        state: clientData.state,
        zip: clientData.zip,
        address: clientData.address,
        phoneNumber: clientData.phoneNumber,
        isServiceDifferent: isServiceAddressDifferent,
      };

      if (isServiceAddressDifferent) {
        payload.serviceAddress = clientData.serviceAddress;
        payload.serviceCity = clientData.serviceCity;
        payload.serviceState = clientData.serviceState;
        payload.serviceZip = clientData.serviceZip;
      }

      const response = await createClient(payload).unwrap();

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
        serviceAddress: "",
        serviceCity: "",
        serviceState: "",
        serviceZip: "",
      });
      setIsServiceAddressDifferent(false);

      return response;
    } catch (error: any) {
      toast.error("Error creating client:", error);

      toast.error(
        error?.data?.message || "Failed to create client. Please try again.",
      );
    }
  };

  const handleCreateEstimate = async () => {
    try {
      const clientId = selectedClient?.id || estimateForm.clientId;

      const estimateNumber =
        estimateForm.estimateNumber ||
        searchParams?.get("estimateNumber") ||
        searchParams?.get("estimateNo") ||
        "";

      if (!clientId) {
        toast.error("Please select a client before creating the estimate.");
        return;
      }

      if (!estimateForm.contractId) {
        toast.error("Please select a contract before creating the estimate.");
        return;
      }

      if (!tableData || !Array.isArray(tableData.items)) {
        toast.error(
          "Please add at least one item before creating the estimate.",
        );
        return;
      }

      const selectedItems = tableData.items.filter(
        (it: any) => it.selectedItem,
      );

      if (selectedItems.length === 0) {
        toast.error(
          "Please add and select at least one item for the estimate.",
        );
        return;
      }

      const hasInvalidQuantity = selectedItems.some(
        (it: any) => (parseFloat(it.quantity) || 0) <= 0,
      );

      if (hasInvalidQuantity) {
        toast.error("Quantity must be greater than 0 for all selected items.");
        return;
      }

      const resolveId = (it: any) =>
        it.selectedItem?.id || it.selectedItem?._id || "";

      const submittedItems = selectedItems.map((it: any) => ({
        id: String(resolveId(it)),
        quantity: Number(it.quantity) || 0,
        subTotal: Math.round(it.total || 0),
      }));

      if (submittedItems.some((item: any) => !item.id)) {
        toast.error(
          "Please reselect the item from the Item List and try again.",
        );
        return;
      }

      const bodyData = {
        estimateName: estimateForm.estimateName,
        estimateNumber,
        clientId,
        date: estimateForm.date,
        endDate: estimateForm.endDate,
        poNumber: String(estimateForm.poNumber ?? ""),
        legendary: estimateForm.legendary,
        contractId: estimateForm.contractId,
        clientSign: estimateForm.clientSign,
        mySign: estimateForm.mySign,
        coverPaymentProcessingFee: estimateForm.coverPaymentProcessingFee,
        isOnlinePayment: estimateForm.isOnlinePayment,
        isAutoInvoice: estimateForm.isAutoInvoice,
        isGroupingEnabled: estimateForm.isGroupingEnabled,
        noteForClient: estimateForm.noteForClient,
        privateNote: estimateForm.privateNote,
        items: submittedItems,
        subItems: tableData?.subItems || [],

        additionalMarkUp:
          (tableData?.summaryMarkup?.percentage ??
            Number(estimateForm.additionalMarkUp)) ||
          0,
        discountAmount: Math.round(tableData.summaryDiscount?.value || 0),
        depositAmount: Math.round(tableData.summaryDeposit?.value || 0),
        grandTotal: Math.round(tableData.grandTotal || calculateFinalTotal()),
      };

      const formData = new FormData();
      formData.append("bodyData", JSON.stringify(bodyData));

      if (sideMap) formData.append("map", sideMap);

      images.forEach((file) => {
        formData.append("urls", file);
      });

      const res = await createEstimate(formData).unwrap();
      const estimateId = res?.result?.id || res?.id || res?._id || "";

      if (!estimateId) {
        toast.error(
          "Estimate was created, but no id was returned for navigation.",
        );
        return;
      }

      const _storedFormat =
        typeof window !== "undefined"
          ? localStorage.getItem("estimateDetailsFormat")
          : null;
      let formatParam = (estimateForm.format ||
        _storedFormat ||
        "description") as string | undefined;
      formatParam = String(formatParam || "description").toLowerCase();
      if (formatParam === "image_pdf") formatParam = "image_pdf";

      toast.success("Estimate created successfully");

      // Reset form...
      setEstimateForm({
        estimateName: "",
        estimateNumber: "",
        clientId: "",
        date: "",
        endDate: "",
        poNumber: "",
        legendary: "",
        contractId: "",
        format: "" as FormatType | "",
        isAutoInvoice: true,
        isGroupingEnabled: true,
        clientSign: true,
        mySign: true,
        coverPaymentProcessingFee: true,
        isOnlinePayment: true,
        noteForClient: "",
        privateNote: "",
        items: [],
        additionalMarkUp: 0,
        grandTotal: 0,
        discountAmount: 0,
        depositAmount: 0,
      });

      setLineItemTables([]);
      setLineItemTables([]);
      setSelectedMarkup(null);
      setDiscount(null);
      setDeposit(null);
      setSelectedClient(null);
      setSideMap(null);
      setImages([]);

      if (sideMapRef.current) sideMapRef.current.value = "";
      if (imageRef.current) imageRef.current.value = "";

      router.push(`/admin/estimate/${estimateId}`);
    } catch (err: any) {
      toast.error("Estimate creation error:", err);
      try {
        const data = err?.data ?? err?.response?.data;
        if (data) {
          toast.error("Create estimate response:", data);
          if (data.errors) {
            toast.error(data.message ?? "Validation failed");
          } else {
            toast.error(data.message ?? "Failed to create estimate");
          }
        } else {
          toast.error(err?.message ?? "Failed to create estimate");
        }
      } catch (e) {
        toast.error("Failed to create estimate");
      }
    }
  };

  return (
    <div className=" bg-gray-50 min-h-screen p-4 md:p-0">
      <div className="flex  md:justify-between gap-3 mb-4">
        <Link
          href={"/admin/estimate"}
          className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-orange-500 transition"
        >
          <ArrowLeft size={25} />
          <h2 className="text-lg font-normal hidden md:block">
            Back to Estimate
          </h2>
        </Link>
        <h2 className="text-xl md:text-2xl font-normal text-center block md:hidden w-full">
          Estimates
        </h2>
        <div className="space-x-4 hidden md:block ">
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

      <div className="md:bg-secondary bg-none border-none md:border rounded-xl md:p-6 space-y-6 mt-12 md:mt-0">
        <div
          onClick={() => setOpenClientModal(true)}
          className="border border-dashed bg-[#E279320D] border-primary rounded-xl p-10 flex items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-50 duration-300"
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
                  {myClients?.length > 0 ? (
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

                        <p className="text-base opacity-80">{client.email}</p>

                        <p className="text-base opacity-70 flex gap-2 items-center">
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
                      <p className="text-base text-gray-500">{client.email}</p>
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
            <label className="text-base text-gray-600">Estimate Name</label>
            <input
              placeholder="Estimate Name"
              value={estimateForm.estimateName}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  estimateName: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
          </div>

          <div>
            <label className="text-base text-gray-600">Estimate Number</label>
            <input
              placeholder="Estimate Number"
              value={estimateForm.estimateNumber}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  estimateNumber: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
          </div>

          <div>
            <label className="text-base text-gray-600">Date</label>
            <input
              type="date"
              value={estimateForm.date}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
          </div>

          <div>
            <label className="text-base text-gray-600">Expiration Date</label>
            <input
              type="date"
              value={estimateForm.endDate}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
            />
          </div>

          <div>
            <label className="text-base text-gray-600">PO Number</label>
            <input
              type="text"
              placeholder="PO Number"
              value={estimateForm.poNumber}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  poNumber: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-base text-gray-600">Legendary</label>
            <input
              placeholder="Legendary"
              value={estimateForm.legendary}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  legendary: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-base text-gray-600">Note for Client</label>
            <textarea
              placeholder="Enter a note for the client..."
              value={estimateForm.noteForClient}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  noteForClient: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-base text-gray-600">Contract </label>
            <input
              onClick={() => setAddContractModalOpen(true)}
              placeholder="Contract "
              value={selectedContractTitle}
              readOnly
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <ContractModal
            open={addContractModalOpen}
            onClose={() => setAddContractModalOpen(false)}
            selectedContractId={estimateForm.contractId}
            onSelectContract={(contractId: string) => {
              setEstimateForm((prev) => ({ ...prev, contractId: contractId }));
              setAddContractModalOpen(false);
            }}
          />
        </div>

        <div>
          <CommonTable key={tableKey} onDataChange={handleCommonTableChange} />
        </div>

        <div>
          <label className="text-lg text-gray-600">Side Map</label>

          <ImageUploadArea
            onFiles={(files) => setSideMap(files[0] ?? null)}
            multiple={false}
          />

          {sideMap && (
            <div className="flex gap-3 mt-4 flex-wrap">
              <div className="relative">
                <Image
                  src={URL.createObjectURL(sideMap)}
                  alt="side map preview"
                  width={120}
                  height={120}
                  className="rounded-lg object-cover w-[120px] h-[120px]"
                />

                <button
                  type="button"
                  onClick={removeSideMap}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-base rounded-full px-2"
                >
                  x
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-lg text-gray-600">Upload Images</label>

          <ImageUploadArea
            onFiles={(files) => setImages((prev) => [...prev, ...files])}
          />

          <div className="flex gap-3 mt-4 flex-wrap">
            {images.map((file, idx) => (
              <div key={idx} className="relative">
                <Image
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  width={120}
                  height={120}
                  className="rounded-lg object-cover w-[120px] h-[120px]"
                />

                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-base rounded-full px-2"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        </div>

        <Summary tableData={tableData} onDataChange={setTableData} />
        <div className="flex justify-end ">
          <div className="grid grid-cols-1  gap-3 my-12 w-full md:w-80 border-t">
            <ToggleSwitch
              label="Stripe"
              description="Accept Debit/Credit, Apple pay, Google pay Stripe Link or Bank Transfer(ACH)"
              checked={estimateForm.isOnlinePayment}
              onToggle={() =>
                setEstimateForm((prev) => ({
                  ...prev,
                  isOnlinePayment: !prev.isOnlinePayment,
                }))
              }
              className="px-4 py-3 border border-gray-200"
            />

            <ToggleSwitch
              label="Client Sign"
              checked={estimateForm.clientSign}
              onToggle={() =>
                setEstimateForm((prev) => ({
                  ...prev,
                  clientSign: !prev.clientSign,
                }))
              }
              className="px-4 py-3 border border-gray-200"
            />

            <ToggleSwitch
              label="My Sign"
              checked={estimateForm.mySign}
              onToggle={() =>
                setEstimateForm((prev) => ({
                  ...prev,
                  mySign: !prev.mySign,
                }))
              }
              className="px-4 py-3 border border-gray-200"
            />

            <ToggleSwitch
              label="Group Items"
              checked={estimateForm.isGroupingEnabled}
              onToggle={() =>
                setEstimateForm((prev) => ({
                  ...prev,
                  isGroupingEnabled: !prev.isGroupingEnabled,
                }))
              }
              className="px-4 py-3 border border-gray-200"
            />
          </div>
        </div>
        <button
          onClick={handleCreateEstimate}
          className="px-5 py-2 md:hidden rounded-lg bg-primary text-white hover:bg-primary/90 w-full transition-colors"
        >
          Submit
        </button>
      </div>

      {openClientModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-xl shadow-lg space-y-3 sm:space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold mb-3">
              Add Client
            </h2>
            <p className="text-2xl font-normal">Basic Information</p>

            {/* Client Name */}
            <div>
              <label className="text-base">Client Name</label>
              <input
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="Client Name"
                className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div>
                <label className="text-base">Email Address</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-base">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <p className="text-xl sm:text-2xl font-normal mt-6 mb-2">
              Billing Address
            </p>

            {/* Address */}
            <div>
              <label className="text-base">Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* City + State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-3">
              <div>
                <label className="text-base">City</label>
                <input
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-base">State</label>
                <input
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Zip */}
            <div className="mt-3">
              <label className="text-base">Zip Code</label>
              <input
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                placeholder="Zip Code"
                className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Toggle */}
            <div className="mt-6">
              <ToggleSwitch
                label="Billing address is different than Service address"
                checked={isServiceAddressDifferent}
                onToggle={() => setIsServiceAddressDifferent(!isServiceAddressDifferent)}
                labelClassName="text-base font-medium text-gray-800"
              />
            </div>

            {/* Service Address */}
            {isServiceAddressDifferent && (
              <>
                <p className="text-xl sm:text-2xl font-normal mt-6 mb-2">
                  Service Address
                </p>

                <div>
                  <label className="text-base">Address</label>
                  <input
                    name="serviceAddress"
                    value={formData.serviceAddress}
                    onChange={handleChange}
                    placeholder="Address"
                    className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-3">
                  <div>
                    <label className="text-base">City</label>
                    <input
                      name="serviceCity"
                      value={formData.serviceCity}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="text-base">State</label>
                    <input
                      name="serviceState"
                      value={formData.serviceState}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="text-base">Zip Code</label>
                  <input
                    name="serviceZip"
                    value={formData.serviceZip}
                    onChange={handleChange}
                    placeholder="Zip Code"
                    className="w-full mt-1 border p-2 sm:p-2.5 text-base rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </>
            )}

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-4 sm:mt-6">
              <button
                onClick={() => setOpenClientModal(false)}
                className="px-4 sm:px-8 py-2 text-base border rounded-xl hover:text-white hover:bg-primary transition-colors duration-300"
              >
                Cancel
              </button>

              <button
                onClick={() => handleCreateClient(formData)}
                className="px-4 sm:px-8 py-2 text-base bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
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
