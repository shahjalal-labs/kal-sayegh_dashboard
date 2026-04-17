"use client";

import { ArrowLeft, Plus } from "lucide-react";
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
  useCreateMarkupMutation,
  useCreateTaxMutation,
  useGetAllItemsQuery,
  useGetAllMarkupsQuery,
  useGetAllTaxesQuery,
  useGetMyClientsQuery,
} from "@/redux/api/admin/estimateApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { LuMapPin } from "react-icons/lu";
import { toast } from "sonner";

// Add these interfaces
interface LineItem {
  id: string;
  description: string;
  itemName: string;
  markUp: number;
  quantity: number;
  tax: number;
  total: number;
  originalItem?: any;
  percentage: number;
  amount: number;
  rate: number; // Added rate field
}

interface LineItemTable {
  id: number;
  items: LineItem[];
}

export default function EstimateDescription() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeTableId, setActiveTableId] = useState<number | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedLineItems, setSelectedLineItems] = useState<any[]>([]);
  const [sideMap, setSideMap] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [submitMarkup, setSubmitMarkup] = useState<() => void>(() => () => {});
  const [openClientModal, setOpenClientModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const sideMapRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLInputElement | null>(null);
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [activeTaxItem, setActiveTaxItem] = useState<any>(null);
  const [addTax, setAddTax] = useState(false);
  const [activeMarkupItem, setActiveMarkupItem] = useState<any>(null);
  const [openCreateMarkupModal, setOpenCreateMarkupModal] = useState(false);

  const openItemModal = (tableId: number) => {
    setActiveTableId(tableId);
    setItemModalOpen(true);
  };

  const openMarkupPicker = (tableId: number, itemId: string) => {
    setActiveMarkupItem({ id: itemId, tableId });
    setAddMarkUp(true);
  };

  const openTaxPicker = (tableId: number, itemId: string) => {
    setActiveTaxItem({ id: itemId, tableId });
    setAddTax(true);
  };

  const [selectedItemsByTable, setSelectedItemsByTable] = useState<{
    [tableId: number]: string;
  }>({});

  const [totalMarkupModalOpen, setTotalMarkupModalOpen] = useState(false);
  const [totalAddMarkup, setTotalAddMarkup] = useState(false);
  const [selectedMarkup, setSelectedMarkup] = useState<any>(null);

  const [createMarkup] = useCreateMarkupMutation();
  const [markupValue, setMarkupValue] = useState({
    name: "",
    percentage: "",
  });

  const [createTax] = useCreateTaxMutation();
  const [taxValue, setTaxValue] = useState({
    name: "",
    percentage: "",
  });

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
    poNumber: "",
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

  const [lineItemTables, setLineItemTables] = useState<LineItemTable[]>([]);
  const [addMarkUp, setAddMarkUp] = useState(false);

  const [createClient, { isLoading }] = useCreateClientMutation();
  const [createEstimate] = useCreateEstimateMutation();

  const { data } = useGetMyClientsQuery({});
  const myClients = data?.result;

  const { data: allItem } = useGetAllItemsQuery({});
  const items = allItem?.result ?? [];

  const { data: allMarkup, refetch } = useGetAllMarkupsQuery();
  const markups = allMarkup?.result ?? [];

  const { data: taxData, refetch: refetchTaxes } = useGetAllTaxesQuery({});
  const allTax = taxData?.result;

  const grandSubtotal = lineItemTables.reduce((acc, table) => {
    return (
      acc +
      table.items.reduce((tAcc, item) => {
        const rate = Number(item.rate) || 0;
        const qty = Number(item.quantity) || 1;
        const base = rate * qty;
        const markupAmount = (base * (Number(item.percentage) || 0)) / 100;
        const afterMarkup = base + markupAmount;
        const taxAmount = (afterMarkup * (Number(item.tax) || 0)) / 100;
        const total = afterMarkup + taxAmount;
        return tAcc + total;
      }, 0)
    );
  }, 0);

  const addLine = () => {
    setLineItemTables((prev) => [
      ...prev,
      {
        id: Date.now(),
        items: [
          {
            id: Date.now().toString(),
            description: "",
            itemName: "",
            markUp: 0,
            quantity: 1,
            tax: 0,
            total: 0,
            percentage: 0,
            amount: 0,
            rate: 0,
          },
        ],
      },
    ]);
  };

  const calculateFinalTotal = () => {
    let total = grandSubtotal;

    if (selectedMarkup?.percentage) {
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

  const handleToggleItem = (item: any) => {
    if (!activeTableId) return;

    setLineItemTables((prev) =>
      prev.map((table) => {
        if (table.id !== activeTableId) return table;

        const isSelected = selectedItemsByTable[table.id] === item.id;

        const newItem = {
          id: Date.now().toString(),
          description: item.description ?? "",
          itemName: item.itemName,
          amount: item?.markUp?.amount ?? 0,
          percentage: item?.markUp?.percentage ?? 0,
          quantity: 0,
          tax: 0,
          rate: item?.markUp?.amount ?? 0,
          markUp: item?.markUp?.amount ?? 0,
          total: 0,
        };

        const updatedItems = isSelected ? [] : [newItem];

        return {
          ...table,
          items: updatedItems,
        };
      }),
    );

    setSelectedItemsByTable((prev) => ({
      ...prev,
      [activeTableId]: item.id,
    }));
  };

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
    if (modalType === "markup") {
      submitMarkup();
    }
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
            onClick: submitMarkup,
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
      const calculateItemTotal = (item: any) => {
        const base = (Number(item.rate) || 0) * (Number(item.quantity) || 1);
        const markupAmount = (base * (Number(item.percentage) || 0)) / 100;
        const afterMarkup = base + markupAmount;
        const taxAmount = (afterMarkup * (Number(item.tax) || 0)) / 100;
        return afterMarkup + taxAmount;
      };

      const bodyData = {
        estimateName: estimateForm.estimateName,
        clientId: selectedClient?.id,
        date: estimateForm.date,
        endDate: estimateForm.endDate,
        poNumber: estimateForm.poNumber,

        items: lineItemTables.flatMap((table) =>
          table.items.map((item) => ({
            id: item.originalItem?.id,
            quantity: Number(item.quantity) || 1,
            subTotal: Math.round(calculateItemTotal(item)),

            rate: Number(item.rate) || 0,
            markup: Number(item.percentage) || 0,
            tax: Number(item.tax) || 0,
          })),
        ),

        additionalMarkUp: selectedMarkup?.percentage || 0,
        discountAmount: discount || 0,
        depositAmount: deposit || 0,

        grandTotal: Math.round(calculateFinalTotal()),
      };

      const formData = new FormData();
      formData.append("bodyData", JSON.stringify(bodyData));

      const allFiles = [];
      if (sideMap) allFiles.push(sideMap);
      images.forEach((file) => allFiles.push(file));

      allFiles.forEach((file) => {
        formData.append("urls", file);
      });

      const res = await createEstimate(formData).unwrap();
      const estimateId = res?.result?.id;

      toast.success("Estimate created successfully");

      // Reset form...
      setEstimateForm({
        estimateName: "",
        clientId: "",
        date: "",
        endDate: "",
        poNumber: "",
        items: [],
        additionalMarkUp: 0,
        grandTotal: 0,
        discountAmount: 0,
        depositAmount: 0,
      });

      setLineItemTables([]);
      setSelectedLineItems([]);
      setSelectedItemsByTable({});
      setSelectedMarkup(null);
      setMarkup(null);
      setDiscount(null);
      setDeposit(null);
      setSelectedClient(null);
      setSideMap(null);
      setImages([]);

      if (sideMapRef.current) sideMapRef.current.value = "";
      if (imageRef.current) imageRef.current.value = "";

      router.push(`/admin/estimate/${estimateId}`);
    } catch (err: any) {
      console.error("Estimate creation error:", err);
      toast.error(err?.data?.message || "Failed to create estimate");
    }
  };

  const handleCreateMarkup = async () => {
    try {
      if (!markupValue.name || !markupValue.percentage) {
        alert("Please fill all fields");
        return;
      }

      const payload = {
        name: markupValue.name,
        percentage: Number(markupValue.percentage),
      };

      const res = await createMarkup(payload).unwrap();

      toast.success("Markup created Successfully");

      setMarkupValue({
        name: "",
        percentage: "",
      });

      setOpenCreateMarkupModal(false);

      setAddMarkUp(true);
      refetch();
    } catch (error) {
      console.error("Create markup failed:", error);
    }
  };

  const handleCreateTax = async () => {
    try {
      const payload = {
        name: taxValue.name,
        percentage: Number(taxValue.percentage),
      };

      await createTax(payload).unwrap();

      toast.success("Tax created successfully");

      setTaxValue({
        name: "",
        percentage: "",
      });

      setTaxModalOpen(false);

      await refetchTaxes();

      setAddTax(true); // reopen list modal
    } catch (error) {
      console.error(error);
      toast.error("Failed to create tax");
    }
  };

  // Helper function to calculate line item total (includes markup and tax)
  const calculateLineTotal = (item: any) => {
    const rate = Number(item.rate) || 0;
    const quantity = Number(item.quantity) || 1;
    const base = rate * quantity;
    const markupAmount = (base * (Number(item.percentage) || 0)) / 100;
    const afterMarkup = base + markupAmount;
    const taxAmount = (afterMarkup * (Number(item.tax) || 0)) / 100;
    return afterMarkup + taxAmount;
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
        <h2 className="text-xl md:text-2xl font-normal text-center block md:hidden w-full">
          Estimates
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
              value={estimateForm.estimateName}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  estimateName: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Date</label>
            <input
              type="date"
              value={estimateForm.date}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  date: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Expiration Date</label>
            <input
              type="date"
              value={estimateForm.endDate}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">PO Number</label>
            <input
              placeholder="PO Number"
              value={estimateForm.poNumber}
              onChange={(e) =>
                setEstimateForm((prev) => ({
                  ...prev,
                  poNumber: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-orange-400"
            />
          </div>
        </div>

        <div>
          {lineItemTables.map((table, index) => (
            <div key={table.id} className="mt-3 w-full">
              <div className="mt-8">
                {index === 0 && (
                  <div className="hidden md:grid md:grid-cols-6 text-base font-semibold border-b pb-2">
                    <p>Description</p>
                    <p>Rate</p>
                    <p>Markup</p>
                    <p>Quantity</p>
                    <p>Tax</p>
                    <p>Total</p>
                  </div>
                )}

                {table.items.map((item: any) => {
                  const rate = item.rate || 0;
                  const quantity = item.quantity || 1;
                  const total = calculateLineTotal(item);

                  return (
                    <div
                      key={item.id}
                      className="mt-3 border rounded-xl overflow-hidden"
                    >
                      {/* Row */}
                      <div className="grid grid-cols-1 md:grid-cols-6 border">
                        <div className="col-span-1 md:col-span-1 border-r md:border-r p-2 text-sm text-gray-500">
                          <label className="block md:hidden font-medium mb-1">
                            Description
                          </label>
                          <div className="flex items-center justify-between border-b md:border-b-0 p-2 md:p-0">
                            <span className="hidden md:inline">
                              Description
                            </span>
                            <span
                              onClick={() => openItemModal(table.id)}
                              className="text-orange-500 text-base cursor-pointer mt-3 md:mt-0"
                            >
                              Item List
                            </span>
                          </div>
                        </div>

                        {/* Rate */}
                        <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0 md:p-0">
                          <label className="block md:hidden text-sm font-medium mb-1">
                            Rate
                          </label>
                          <input
                            className="cell w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition p-2"
                            placeholder="$0.00"
                            value={rate || ""}
                            onChange={(e) => {
                              const newRate = parseFloat(e.target.value) || 0;
                              setLineItemTables((prev) =>
                                prev.map((t) =>
                                  t.id === table.id
                                    ? {
                                        ...t,
                                        items: t.items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, rate: newRate }
                                            : i,
                                        ),
                                      }
                                    : t,
                                ),
                              );
                            }}
                          />
                        </div>

                        {/* Markup */}
                        <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0 md:p-0">
                          <label className="block md:hidden text-sm font-medium mb-1">
                            Markup
                          </label>
                          <input
                            className="cell cursor-pointer bg-white/90 w-full p-2"
                            placeholder="Markup"
                            value={item.percentage ? `${item.percentage}%` : ""}
                            readOnly
                            onClick={() => openMarkupPicker(table.id, item.id)}
                          />
                        </div>

                        {/* Quantity */}
                        <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0 md:p-0">
                          <label className="block md:hidden text-sm font-medium mb-1">
                            Quantity
                          </label>
                          <input
                            className="cell w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition p-2"
                            placeholder="1"
                            value={quantity}
                            onChange={(e) => {
                              const newQuantity =
                                parseFloat(e.target.value) || 1;
                              setLineItemTables((prev) =>
                                prev.map((t) =>
                                  t.id === table.id
                                    ? {
                                        ...t,
                                        items: t.items.map((i) =>
                                          i.id === item.id
                                            ? { ...i, quantity: newQuantity }
                                            : i,
                                        ),
                                      }
                                    : t,
                                ),
                              );
                            }}
                          />
                        </div>

                        {/* Tax */}
                        <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0 md:p-0">
                          <label className="block md:hidden text-sm font-medium mb-1">
                            Tax
                          </label>
                          <input
                            className="cell w-full p-2"
                            placeholder="Tax"
                            value={item.tax ? `${item.tax}%` : ""}
                            readOnly
                            onClick={() => openTaxPicker(table.id, item.id)}
                          />
                        </div>

                        {/* Total */}
                        <div className="md:col-span-1 p-2">
                          <label className="block md:hidden text-sm font-medium mb-1">
                            Total
                          </label>
                          <input
                            className="cell w-full p-2"
                            value={`$${total.toFixed(2)}`}
                            readOnly
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="border-t p-2">
                        {!item.itemName ? (
                          <textarea
                            placeholder="Notes"
                            className="w-full p-2 text-sm outline-none"
                          />
                        ) : (
                          <div className="mt-2">
                            <p className="text-sm font-semibold">
                              {item.itemName}
                            </p>

                            {item.description && (
                              <p className="text-xs text-gray-500">
                                {item.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <button
            onClick={addLine}
            className="mt-4 w-full border border-orange-400 text-orange-500 rounded-lg py-2 flex items-center justify-center md:justify-start p-4 gap-2"
          >
            <Plus size={16} /> Add Line Item
          </button>
        </div>

        <div>
          <label className="text-base font-normal">Side Map</label>

          <div
            onClick={() => document.getElementById("sideMapInput")?.click()}
            className="mt-2 border border-dashed border-orange-300 rounded-xl p-6 flex flex-col items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-100/60 bg-orange-50 duration-300"
          >
            {sideMap ? (
              <Image
                alt="side map"
                width={400}
                height={300}
                src={URL.createObjectURL(sideMap)}
                className="w-full h-40 object-contain rounded-lg"
              />
            ) : (
              <>
                <Image
                  src={cloud}
                  alt="cloud"
                  width={40}
                  height={40}
                  className="mb-2"
                />
                Upload Side Map
              </>
            )}
          </div>

          <input
            ref={sideMapRef}
            id="sideMapInput"
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setSideMap(e.target.files[0]);
              }
            }}
          />
        </div>

        <div>
          <label className="text-base font-normal">Upload Image</label>

          <div
            onClick={() => document.getElementById("imageInput")?.click()}
            className="mt-2 border border-dashed border-orange-300 rounded-xl p-6 flex flex-col items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-100/60 bg-orange-50 duration-300"
          >
            {images.length > 0 ? (
              <div className=" w-full">
                {images.map((file, idx) => (
                  <Image
                    alt="upload images"
                    width={400}
                    height={400}
                    key={idx}
                    src={URL.createObjectURL(file)}
                    className="w-full h-40 object-contain rounded-lg"
                  />
                ))}
              </div>
            ) : (
              <>
                <Image
                  src={cloud}
                  alt="cloud"
                  width={40}
                  height={40}
                  className="mb-2"
                />
                Upload Image
              </>
            )}
          </div>

          <input
            ref={imageRef}
            id="imageInput"
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                setImages(Array.from(e.target.files));
              }
            }}
          />
        </div>

        <div className="mt-6 flex justify-end">
          <div className="w-[356px] flex flex-col space-y-3">
            <div className="flex justify-between items-center border-b py-1">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="font-semibold text-gray-900">
                ${grandSubtotal.toFixed(2)}
              </span>
            </div>

            {/* Markup */}
            <div className="flex justify-between items-center border-b py-1">
              <span className="text-gray-700 font-medium">Markup</span>

              {selectedMarkup ? (
                <span
                  onClick={() => setTotalAddMarkup(true)}
                  className="font-semibold text-gray-900 cursor-pointer"
                >
                  {selectedMarkup.percentage}%
                </span>
              ) : (
                <button
                  onClick={() => setTotalAddMarkup(true)}
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
              <span className="text-orange-500 font-bold text-lg">
                ${calculateFinalTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <CustomModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          maxWidth="sm"
          actions={getModalActions()}
        >
          {modalType === "markup" && (
            <MarkupModalContent setSubmit={setSubmitMarkup} />
          )}

          {modalType === "discount" && (
            <DiscountModalContent value={tempValue} setValue={setTempValue} />
          )}

          {modalType === "deposit" && (
            <DepositModalContent value={tempValue} setValue={setTempValue} />
          )}
        </CustomModal>

        {/* items modal */}
        <CustomModal
          open={itemModalOpen}
          onClose={() => setItemModalOpen(false)}
          title="Item List"
          actions={[
            {
              label: "Cancel",
              variant: "secondary",
              onClick: () => setItemModalOpen(false),
            },
            {
              label: "Add",
              variant: "primary",
              onClick: () => setItemModalOpen(false),
            },
          ]}
        >
          <div className="space-y-3">
            {items.map((item: any) => {
              const isSelected =
                activeTableId &&
                selectedItemsByTable[activeTableId] === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item)}
                  className={`flex justify-between items-start border p-3 rounded-xl cursor-pointer transition ${
                    isSelected ? "bg-orange-50 border-orange-400" : ""
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">
                      {item.itemName}
                    </p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="font-semibold text-gray-800">
                      ${item?.markUp?.amount || 0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CustomModal>

        <button
          onClick={handleCreateEstimate}
          className="px-5 py-2 md:hidden rounded-lg bg-primary text-white hover:bg-primary/90 w-full transition-colors"
        >
          Submit
        </button>
      </div>

      {addMarkUp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold">Select Markup</h2>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {markups?.length > 0 ? (
                markups.map((m: any) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (!activeMarkupItem) return;

                      setLineItemTables((prev) =>
                        prev.map((table) => {
                          if (table.id !== activeMarkupItem.tableId)
                            return table;

                          return {
                            ...table,
                            items: table.items.map((i) =>
                              i.id === activeMarkupItem.id
                                ? {
                                    ...i,
                                    percentage: m.percentage,
                                  }
                                : i,
                            ),
                          };
                        }),
                      );

                      setAddMarkUp(false);
                    }}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-orange-50"
                  >
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.percentage}%</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center">
                  No markup found
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setAddMarkUp(false);
                setOpenCreateMarkupModal(true);
              }}
              className="flex items-center gap-2  mt-3  py-4"
            >
              <GoPlus
                size={30}
                className="text-lg bg-primary p-1 text-white rounded-full"
              />
              <span className="font-medium">Add Markup</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setAddMarkUp(false)}
                className="w-full mt-3 border border-primary  py-2 rounded-xl hover:bg-primary hover:text-white duration-300 ease-in"
              >
                Close
              </button>

              <button
                onClick={() => setAddMarkUp(false)}
                className="w-full mt-3 bg-primary hover:bg-primary/90 text-white transition-colors py-2 rounded-xl "
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {openCreateMarkupModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-2xl shadow-xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            {/* HEADER */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Markup</h2>
            </div>

            {/* INPUTS */}
            <div className="space-y-4">
              {/* NAME */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Markup Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Service Charge"
                  value={markupValue.name}
                  onChange={(e) =>
                    setMarkupValue((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none p-2.5 rounded-lg"
                />
              </div>

              {/* PERCENTAGE */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={markupValue.percentage}
                  onChange={(e) =>
                    setMarkupValue((prev) => ({
                      ...prev,
                      percentage: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none p-2.5 rounded-lg"
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setOpenCreateMarkupModal(false)}
                className="w-full border border-gray-300 py-2.5 rounded-xl hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateMarkup}
                className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-xl transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAX LIST MODAL */}
      {addTax && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl p-5 space-y-3">
            {/* TITLE */}
            <h2 className="text-lg font-semibold">Select Tax</h2>

            {/* TAX LIST */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {allTax?.length > 0 ? (
                allTax.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      if (!activeTaxItem) return;

                      setLineItemTables((prev) =>
                        prev.map((table) => {
                          if (table.id !== activeTaxItem.tableId) return table;

                          return {
                            ...table,
                            items: table.items.map((i) =>
                              i.id === activeTaxItem.id
                                ? {
                                    ...i,
                                    tax: t.percentage,
                                  }
                                : i,
                            ),
                          };
                        }),
                      );

                      setAddTax(false);
                    }}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-orange-50"
                  >
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-gray-500">{t.percentage}%</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center">
                  No tax found
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setAddTax(false);
                setTaxModalOpen(true);
              }}
              className="flex items-center gap-2 mt-3 py-4"
            >
              <GoPlus
                size={30}
                className="text-lg bg-primary p-1 text-white rounded-full"
              />
              <span className="font-medium">Add Tax</span>
            </button>

            {/* FOOTER */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAddTax(false)}
                className="w-full mt-3 border border-primary py-2 rounded-xl hover:bg-primary hover:text-white duration-300 ease-in"
              >
                Close
              </button>

              <button
                onClick={() => setAddTax(false)}
                className="w-full mt-3 bg-primary hover:bg-primary/90 text-white transition-colors py-2 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {taxModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold">Create Tax</h2>

            {/* NAME */}
            <input
              type="text"
              placeholder="Tax name"
              value={taxValue.name}
              onChange={(e) =>
                setTaxValue((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full border p-2 rounded"
            />

            {/* PERCENTAGE */}
            <input
              type="number"
              placeholder="Enter tax %"
              value={taxValue.percentage}
              onChange={(e) =>
                setTaxValue((prev) => ({
                  ...prev,
                  percentage: e.target.value,
                }))
              }
              className="w-full border p-2 rounded"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setTaxModalOpen(false)}
                className="w-full border py-2 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateTax}
                className="w-full bg-primary text-white py-2 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

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

      {totalMarkupModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[420px] rounded-2xl shadow-xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            {/* HEADER */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Markup</h2>
            </div>

            {/* INPUTS */}
            <div className="space-y-4">
              {/* NAME */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Markup Name
                </label>
                <input
                  type="text"
                  value={markupValue.name}
                  onChange={(e) =>
                    setMarkupValue((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                />
              </div>

              {/* PERCENTAGE */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">
                  Percentage (%)
                </label>
                <input
                  type="number"
                  value={markupValue.percentage}
                  onChange={(e) =>
                    setMarkupValue((prev) => ({
                      ...prev,
                      percentage: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 p-2.5 rounded-lg"
                />
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setTotalMarkupModalOpen(false)}
                className="w-full border border-gray-300 py-2.5 rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleCreateMarkup}
                className="w-full bg-primary text-white py-2.5 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {totalAddMarkup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl p-5 space-y-3">
            <h2 className="text-lg font-semibold">Select Markup</h2>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {markups?.length > 0 ? (
                markups.map((m: any) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMarkup(m);
                      setTotalAddMarkup(false);
                    }}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-orange-50"
                  >
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-gray-500">{m.percentage}%</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center">
                  No markup found
                </p>
              )}
            </div>

            {/* ADD NEW MARKUP */}
            <button
              onClick={() => {
                setTotalAddMarkup(false);
                setTotalMarkupModalOpen(true);
              }}
              className="flex items-center gap-2 mt-3 py-4"
            >
              <GoPlus
                size={30}
                className="text-lg bg-primary p-1 text-white rounded-full"
              />
              <span className="font-medium">Add Markup</span>
            </button>

            {/* FOOTER */}
            <div className="flex gap-3">
              <button
                onClick={() => setTotalAddMarkup(false)}
                className="w-full border py-2 rounded-xl"
              >
                Close
              </button>

              <button
                onClick={() => setTotalAddMarkup(false)}
                className="w-full bg-primary text-white py-2 rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
