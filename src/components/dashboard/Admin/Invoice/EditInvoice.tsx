"use client";

import InvoiceContractModal from "@/components/dashboard/Admin/Invoice/InvoiceContractModal";
import CommonTable from "@/components/table/CommonTable";
import Summary from "@/components/table/summary";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import {
  useAddContractMutation,
  useDeleteContractMutation,
  useGetAllContractsQuery,
  useUpdateContractMutation,
} from "@/redux/api/admin/contractApi";
import { useGetMyClientsQuery } from "@/redux/api/admin/estimateApi";
import {
  useGetInvoiceByIdQuery,
  useUpdateInvoiceMutation,
} from "@/redux/api/admin/invoiceApi";
import { ArrowLeft, MapPin, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AiOutlineUserAdd } from "react-icons/ai";
import { toast } from "sonner";

export default function EditInvoice() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceIdParam = searchParams?.get("id") || "";

  const { data: invoiceData, isLoading: isFetching } = useGetInvoiceByIdQuery(
    invoiceIdParam,
    { skip: !invoiceIdParam },
  );

  const [updateInvoice, { isLoading }] = useUpdateInvoiceMutation();
  const [addContract, { isLoading: isAddingContract }] =
    useAddContractMutation();
  const [updateContract] = useUpdateContractMutation();
  const [deleteContract] = useDeleteContractMutation();
  const { data: allContracts, refetch: refetchContracts } =
    useGetAllContractsQuery({});
  const contracts = allContracts?.result?.data ?? [];

  const [formData, setFormData] = useState({
    additionalMarkUp: 0,
    clientId: "",
    clientSign: true,
    contractId: "",
    coverPaymentProcessingFee: true,
    date: "",
    depositAmount: 0,
    discountAmount: 0,
    endDate: "",
    grandTotal: 0,
    invoiceName: "",
    invoiceNumber: "",
    isGroupingEnabled: false,
    isOnlinePayment: true,
    items: [],
    legendary: "",
    mySign: true,
    poNumber: "",
    daysToPay: "",
    noteForClient: "",
    privateNote: "",
  });

  const [tableData, setTableData] = useState<any>(null);
  const [initialTableItems, setInitialTableItems] = useState<any[]>([]);
  const [tableKey, setTableKey] = useState(0);

  const [sideMaps, setSideMaps] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const sideMapRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const [showAll, setShowAll] = useState(false);
  const [openClientModal, setOpenClientModal] = useState(false);
  const [addContractModalOpen, setAddContractModalOpen] = useState(false);
  const [newContract, setNewContract] = useState({
    title: "",
    description: "",
  });
  const [editContract, setEditContract] = useState<{
    id: string | null;
    title: string;
    description: string;
  }>({ id: null, title: "", description: "" });

  const { data } = useGetMyClientsQuery({});
  const myClients = data?.result || [];
  const selectedContractTitle =
    contracts.find(
      (contractItem: any) => contractItem.id === formData.contractId,
    )?.title ?? "";

  const handleCreateContract = async () => {
    try {
      if (!newContract.title.trim() || !newContract.description.trim()) {
        toast.error("Please fill both contract fields");
        return;
      }

      const res = await addContract({
        title: newContract.title.trim(),
        description: newContract.description.trim(),
      }).unwrap();

      toast.success("Contract created successfully");

      const newContractId =
        res?.result?.id || res?.result?._id || res?.id || res?._id || "";

      if (newContractId) {
        setFormData((prev: any) => ({ ...prev, contractId: newContractId }));
      }

      setNewContract({ title: "", description: "" });

      await refetchContracts();
      setAddContractModalOpen(false);
    } catch (error) {
      console.error("Failed to create contract:", error);
      toast.error("Failed to create contract");
    }
  };

  const handleDeleteContract = async (contractId: any) => {
    try {
      await deleteContract(contractId).unwrap();
      toast.success("Contract deleted successfully");
    } catch (error) {
      console.error("Failed to delete contract:", error);
      toast.error("Failed to delete contract");
    } finally {
      await refetchContracts();
    }
  };

  const handleUpdateContract = async () => {
    if (!editContract.id) return;

    try {
      await updateContract({
        contractId: editContract.id,
        title: editContract.title,
        description: editContract.description,
      }).unwrap();

      toast.success("Contract updated successfully");
      setEditContract({ id: null, title: "", description: "" });
      await refetchContracts();
      setAddContractModalOpen(false);
    } catch (error) {
      console.error("Failed to update contract:", error);
      toast.error("Failed to update contract");
    }
  };

  useEffect(() => {
    const invoice = (invoiceData as any)?.result;
    if (!invoice) return;

    setFormData((prev: any) => ({
      ...prev,
      invoiceName: invoice.invoiceName || invoice.name || "",
      invoiceNumber: invoice.invoiceNumber || "",
      format: invoice.format || "TABLE",
      date: invoice.date || "",
      poNumber: invoice.poNumber || "",
      daysToPay: invoice.daysToPay || invoice.days_to_pay || "",
      legendary: invoice.legendary || "",
      endDate: invoice.endDate || "",
      clientId:
        invoice.clientId || invoice.client?.id || invoice.client?._id || "",
      contractId:
        invoice.contractId ||
        invoice.contract?.id ||
        invoice.contract?._id ||
        "",
      isGroupingEnabled:
        typeof invoice.isGroupingEnabled === "boolean"
          ? invoice.isGroupingEnabled
          : false,
      clientSign:
        typeof invoice.clientSign === "boolean" ? invoice.clientSign : true,
      mySign: typeof invoice.mySign === "boolean" ? invoice.mySign : true,
      isOnlinePayment:
        typeof invoice.isOnlinePayment === "boolean"
          ? invoice.isOnlinePayment
          : true,
      coverPaymentProcessingFee:
        typeof invoice.coverPaymentProcessingFee === "boolean"
          ? invoice.coverPaymentProcessingFee
          : true,
    }));

    const client = invoice.client || null;
    if (client) setSelectedClient(client);

    if (invoice.items) {
      const seededItems = invoice.items.map((it: any, index: number) => ({
        rowId: index + 1,
        selectedItem: it,
        rate: it.rate ?? it.amount ?? 0,
        quantity: it.quantity || 1,
        total: it.subTotal || it.total || 0,
      }));

      setInitialTableItems(seededItems);

      setTableData({
        items: seededItems.map((it: any) => ({
          selectedItem: it.selectedItem,
          quantity: it.quantity,
          total: it.total,
        })),
        grandTotal: invoice.grandTotal || 0,
      });
      setTableKey((k) => k + 1);
    }
  }, [invoiceData]);

  const [clientForm, setClientForm] = useState({
    clientName: "",
    email: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSideMapFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setSideMaps((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeSideMap = (index: number) => {
    setSideMaps((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setImages((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!tableData) return;

    const selectedItems = tableData.items.filter(
      (item: any) => item.selectedItem,
    );

    if (selectedItems.length === 0) {
      toast.error("Please add and select at least one invoice item.");
      return;
    }

    const hasInvalidQuantity = selectedItems.some(
      (item: any) => (parseFloat(item.quantity) || 0) <= 0,
    );

    if (hasInvalidQuantity) {
      toast.error("Quantity must be greater than 0 for all selected items.");
      return;
    }

    const clientId = selectedClient?.id || formData.clientId;

    if (!clientId) {
      toast.error("Please select a client before updating the invoice.");
      return;
    }

    const bodyData = {
      additionalMarkUp: tableData.summaryMarkup?.percentage || 0,
      clientId,
      contractId: formData.contractId,
      date: formData.date,

      invoiceNumber: formData.invoiceNumber,
      poNumber: formData.poNumber,
      clientSign: formData.clientSign,
      mySign: formData.mySign,
      isGroupingEnabled: formData.isGroupingEnabled,
      isOnlinePayment: formData.isOnlinePayment,
      coverPaymentProcessingFee: formData.coverPaymentProcessingFee,
      depositAmount: Math.round(tableData.summaryDeposit?.value || 0),
      discountAmount: Math.round(tableData.summaryDiscount?.value || 0),
      endDate: formData.endDate,
      grandTotal: Math.round(tableData.grandTotal || 0),
      invoiceName: formData.invoiceName,
      legendary: formData.legendary,
      items: selectedItems.map((item: any) => ({
        id: item.selectedItem.id || item.selectedItem._id || "",
        quantity: parseFloat(item.quantity) || 0,
        subTotal: Math.round(item.total),
      })),
    };

    try {
      const formPayload = new FormData();
      formPayload.append("bodyData", JSON.stringify(bodyData));

      sideMaps.forEach((file) => {
        formPayload.append("map", file);
      });

      images.forEach((file) => {
        formPayload.append("urls", file);
      });

      const res = await updateInvoice({
        invoiceId: invoiceIdParam,
        formData: formPayload,
      }).unwrap();

      toast.success("Invoice has been updated successfully!");

      router.push(`/admin/invoice/${invoiceIdParam}`);
    } catch (err: any) {
      try {
        const data = err?.data || err?.response?.data;
        if (data) {
          if (data.errors) {
            toast.error(data.message || "Validation failed");
          } else {
            toast.error(data.message || "Failed to update invoice");
          }
        } else {
          toast.error(err?.message || "Failed to update invoice");
        }
      } catch (e) {
        toast.error("Failed to update invoice");
      }
    }
  };

  return (
    <div className="">
      <Link
        href={"/admin/invoice"}
        className="hidden md:flex items-center gap-2 p-2 rounded-lg hover:text-primary text-base font-medium"
      >
        <ArrowLeft className="mt-[1px]" size={20} />
        <span>Back to invoices</span>
      </Link>

      <div className="min-h-screen p-6 bg-secondary rounded-2xl shadow-sm mt-4 md:px-12">
        <div className="">
          <div className="flex items-center justify-between mb-4  md:hidden">
            <Link
              href={"/admin/invoice"}
              className="p-2 rounded-lg  flex items-center gap-2"
            >
              <ArrowLeft size={20} />
            </Link>

            <h2 className="text-2xl font-semibold text-center flex-1 block">
              Edit Invoice
            </h2>

            <div className="w-8" />
          </div>

          <div className="hidden md:flex md:justify-end md:gap-3 md:mb-6">
            <Link
              href={"/admin/invoice"}
              className="px-8 py-2 rounded-xl border-primary border text-primary hover:bg-primary hover:text-white duration-300 ease-in"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-2 bg-primary hover:bg-primary/80 transition-colors text-white rounded-lg"
            >
              Update Invoice
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            <div className="col-span-2 hidden md:block text-lg">
              <p className="text-base text-gray-500">United States</p>
              <p className="text-base text-gray-500">kal@geopaving.com</p>
            </div>

            <div className="space-y-4 mt-10 md:mt-10">
              <div
                onClick={() => setOpenClientModal(true)}
                className="border border-dashed border-primary bg-orange-50 hover:bg-orange-100 rounded-xl p-10 flex items-center justify-center text-orange-500 cursor-pointer  duration-300"
              >
                <AiOutlineUserAdd className="mr-2 inline-block" size={20} />
                <span>Add Client</span>
              </div>

              <div>
                <button
                  onClick={() => setOpen(true)}
                  className="border-primary border rounded-xl px-6 py-2 text-primary hover:bg-primary hover:text-white transition w-full md:w-auto"
                >
                  {selectedClient
                    ? selectedClient.clientName
                    : "View All Client"}
                </button>

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

                      <div className="p-4 overflow-y-auto space-y-3">
                        {myClients.length > 0 ? (
                          myClients.map((client: any) => (
                            <div
                              key={client.id}
                              onClick={() => {
                                setSelectedClient(client);
                                setFormData((prev: any) => ({
                                  ...prev,
                                  clientId: client.id,
                                }));
                                setOpen(false);
                              }}
                              className={`p-4 border rounded-xl cursor-pointer transition shadow-sm ${selectedClient?.id === client.id ? "bg-primary text-white border-primary" : "hover:bg-orange-50"}`}
                            >
                              <p className="font-semibold text-base">
                                {client.clientName}
                              </p>
                              <p className="text-sm opacity-80">
                                {client.email}
                              </p>

                              <p className="text-xs opacity-70 flex gap-2 items-center">
                                <MapPin /> {client.address || "No address"}
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

              {showAll && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                  <div className="bg-white w-[90%] md:w-[500px] max-h-[80vh] rounded-2xl p-5 shadow-xl flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold">All Clients</h2>
                      <button
                        onClick={() => setShowAll(false)}
                        className="text-gray-500 hover:text-red-500 text-xl"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="overflow-y-auto space-y-2 pr-2">
                      {myClients?.length > 0 ? (
                        myClients.map((client: any) => (
                          <div
                            key={client.id}
                            className="p-3 border rounded-lg hover:bg-orange-50 cursor-pointer transition"
                          >
                            <p className="font-medium">{client.clientName}</p>
                            <p className="text-sm text-gray-500">
                              {client.email}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-400">
                          No clients found
                        </p>
                      )}
                    </div>

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

              <div className="space-y-2">
                <label>Invoice</label>
                <input
                  placeholder="Invoice#"
                  className="input w-full focus:ring-primary focus:outline-none focus:ring-1 rounded-lg"
                  value={formData.invoiceName}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      invoiceName: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label>Date</label>
                <input
                  type="date"
                  className="input w-full focus:ring-primary focus:outline-none focus:ring-1 rounded-lg"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      date: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label>End Date</label>
                <input
                  type="date"
                  className="input w-full focus:ring-primary focus:outline-none focus:ring-1 rounded-lg"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label>Days to pay</label>
                <input
                  placeholder="Days to pay"
                  className="input w-full focus:ring-primary focus:outline-none focus:ring-1 rounded-lg"
                  value={formData.daysToPay}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      daysToPay: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label>Legendary</label>
                <input
                  placeholder="Legendary"
                  className="input w-full focus:ring-primary focus:outline-none focus:ring-1 rounded-lg"
                  value={formData.legendary}
                  onChange={(e) =>
                    setFormData((prev: any) => ({
                      ...prev,
                      legendary: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label>Contract</label>
                <button
                  type="button"
                  onClick={() => setAddContractModalOpen(true)}
                  className="input w-full text-left focus:ring-primary focus:outline-none focus:ring-1 rounded-lg"
                >
                  {selectedContractTitle || "Select contract"}
                </button>
              </div>
            </div>
          </div>

          <CommonTable
            key={tableKey}
            onDataChange={setTableData}
            initialItems={initialTableItems}
          />
          <div className="mt-7">
            <label className="text-lg text-gray-600">Side Map</label>

            <input
              ref={sideMapRef}
              id="sideMapInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleSideMapFiles(e.target.files)}
            />

            <label
              htmlFor="sideMapInput"
              onDrop={(e) => {
                e.preventDefault();
                handleSideMapFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="mt-2 border border-dashed border-primary rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer bg-orange-50"
            >
              <Upload className="text-gray-400 mb-2" size={24} />
              <p className="text-lg text-gray-600 ">
                <span className="text-primary font-medium">
                  Click to upload
                </span>{" "}
                or drag & drop
              </p>
            </label>

            {sideMaps.length > 0 && (
              <div className="flex gap-3 mt-4 flex-wrap">
                {sideMaps.map((file, idx) => (
                  <div key={idx} className="relative">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="side map preview"
                      width={120}
                      height={120}
                      className="rounded-lg object-cover w-[120px] h-[120px]"
                    />

                    <button
                      type="button"
                      onClick={() => removeSideMap(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-7">
            <label className="text-lg text-gray-600">Upload Images</label>

            <input
              ref={imageRef}
              id="imageInput"
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageFiles(e.target.files)}
            />

            <label
              htmlFor="imageInput"
              onDrop={(e) => {
                e.preventDefault();
                handleImageFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="mt-2 border border-dashed border-primary rounded-xl  flex flex-col items-center justify-center cursor-pointer bg-orange-50 p-12"
            >
              <Upload className="text-gray-400 mb-2" size={24} />
              <p className="text-lg text-gray-600 ">
                <span className="text-primary font-medium">
                  Click to upload
                </span>{" "}
                or drag & drop
              </p>
            </label>

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
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Summary tableData={tableData} onDataChange={setTableData} />

          <div className="flex justify-end my-12">
            <div className="w-full md:w-80 space-y-3 border-t">
              <ToggleSwitch
                label="Client Sign"
                checked={formData.clientSign}
                onToggle={() =>
                  setFormData((prev: any) => ({
                    ...prev,
                    clientSign: !prev.clientSign,
                  }))
                }
                className="px-4 py-3 border border-gray-200"
              />

              <ToggleSwitch
                label="My Sign"
                checked={formData.mySign}
                onToggle={() =>
                  setFormData((prev: any) => ({
                    ...prev,
                    mySign: !prev.mySign,
                  }))
                }
                className="px-4 py-3 border border-gray-200"
              />

              <ToggleSwitch
                label="Group Items"
                checked={formData.isGroupingEnabled}
                onToggle={() =>
                  setFormData((prev: any) => ({
                    ...prev,
                    isGroupingEnabled: !prev.isGroupingEnabled,
                  }))
                }
                className="px-4 py-3 border border-gray-200"
              />

              <ToggleSwitch
                label="Stripe"
                description="Accept Debit/Credit, Apple pay, Google pay Stripe Link or Bank Transfer(ACH)"
                checked={formData.isOnlinePayment}
                onToggle={() =>
                  setFormData((prev: any) => ({
                    ...prev,
                    isOnlinePayment: !prev.isOnlinePayment,
                  }))
                }
                className="px-4 py-3 border border-gray-200"
              />

              <ToggleSwitch
                label="Cover Payment Processing Fee"
                description="Applies a markup to cover your processing fee"
                checked={formData.coverPaymentProcessingFee}
                onToggle={() =>
                  setFormData((prev: any) => ({
                    ...prev,
                    coverPaymentProcessingFee: !prev.coverPaymentProcessingFee,
                  }))
                }
                className="px-4 py-3 border border-gray-200"
                descriptionClassName="mt-1"
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 mt-12 md:hidden rounded-lg bg-primary text-white hover:bg-primary/90 w-full transition-colors"
          >
            Update
          </button>
        </div>

        <InvoiceContractModal
          open={addContractModalOpen}
          onClose={() => setAddContractModalOpen(false)}
          contracts={contracts}
          selectedContractId={formData.contractId}
          onSelectContract={(contractId) =>
            setFormData((prev: any) => ({ ...prev, contractId }))
          }
          newContract={newContract}
          setNewContract={setNewContract}
          editContract={editContract}
          setEditContract={setEditContract}
          onCreateContract={handleCreateContract}
          onUpdateContract={handleUpdateContract}
          onDeleteContract={handleDeleteContract}
          isCreating={isAddingContract}
        />

        {openClientModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white w-full max-w-[700px] p-4 md:p-6 rounded-xl shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Add Client</h2>

              <div>
                <label className="text-sm">Client Name</label>
                <input
                  name="clientName"
                  value={clientForm.clientName}
                  onChange={handleClientChange}
                  placeholder="Client Name"
                  className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">Email Address</label>
                  <input
                    name="email"
                    value={clientForm.email}
                    onChange={handleClientChange}
                    placeholder="Email Address"
                    className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm">Phone Number</label>
                  <input
                    name="phoneNumber"
                    value={clientForm.phoneNumber}
                    onChange={handleClientChange}
                    placeholder="Phone Number"
                    className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <p className="text-base font-normal">Address Information</p>

              <div>
                <label className="text-sm">Address</label>
                <input
                  name="address"
                  value={clientForm.address}
                  onChange={handleClientChange}
                  placeholder="Address"
                  className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm">City</label>
                  <input
                    name="city"
                    value={clientForm.city}
                    onChange={handleClientChange}
                    placeholder="City"
                    className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm">State</label>
                  <input
                    name="state"
                    value={clientForm.state}
                    onChange={handleClientChange}
                    placeholder="State"
                    className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm">Zip</label>
                <input
                  name="zip"
                  value={clientForm.zip}
                  onChange={handleClientChange}
                  placeholder="Zip"
                  className="w-full mt-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setOpenClientModal(false)}
                  className="px-8 py-2 border border-primary rounded-xl hover:text-white hover:bg-primary transition-colors duration-300"
                >
                  Cancel
                </button>

                <button
                  onClick={() => setOpenClientModal(false)}
                  className="px-8 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .input {
            width: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 8px;
            font-size: 14px;
          }

          .cell {
            border-left: 1px solid #e5e7eb;
            padding: 8px;
            font-size: 14px;
            outline: none;
          }
        `}</style>
      </div>
    </div>
  );
}
