"use client";

import { ArrowLeft, Check, Minus, Plus, Upload } from "lucide-react";
import Link from "next/link";
import { AiOutlineUserAdd } from "react-icons/ai";

import { CustomModal } from "@/components/modal/CustomModal";
import {
  DepositModalContent,
  DiscountModalContent,
  MarkupModalContent,
} from "@/components/modal/PopUp";
import {
  useAddContractMutation,
  useDeleteContractMutation,
  useGetAllContractsQuery,
  useUpdateContractMutation,
} from "@/redux/api/admin/contractApi";
import {
  useCreateClientMutation,
  useCreateMarkupMutation,
  useCreateTaxMutation,
  useEditEstimateMutation,
  useGetAllItemsQuery,
  useGetAllMarkupsQuery,
  useGetAllTaxesQuery,
  useGetEstimateByIdQuery,
  useGetMyClientsQuery,
} from "@/redux/api/admin/estimateApi";
import { FormatType } from "@/types/estimate.type";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { GoPlus } from "react-icons/go";
import { LuMapPin } from "react-icons/lu";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";

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
  rate: number;
}

interface LineItemTable {
  id: number;
  items: LineItem[];
  format?: FormatType;
}

interface PrefilledSummary {
  subtotal: number;
  markupAmount: number;
  discountAmount: number;
  depositAmount: number;
  grandTotal: number;
}

export default function EditEstimate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEstimateId =
    searchParams.get("id") || searchParams.get("estimateId") || "";
  const detailsFormat = searchParams.get("format") || "description";
  const [estimateId, setEstimateId] = useState(queryEstimateId);
  const [open, setOpen] = useState(false);
  const [activeTableId, setActiveTableId] = useState<number | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedLineItems, setSelectedLineItems] = useState<any[]>([]);
  const [sideMaps, setSideMaps] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingSideMapUrls, setExistingSideMapUrls] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
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

  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("description");
  const [selectedFormat, setSelectedFormat] =
    useState<FormatType>("DESCRIPTION");

  const mapSelectedToFormat = (sel: string) => {
    switch ((sel || "").toLowerCase()) {
      case "table":
        return "TABLE" as FormatType;
      case "image_pdf":
      case "upload":
        return "IMAGE_PDF" as FormatType;
      case "description":
        return "DESCRIPTION" as FormatType;
      default:
        return "DESCRIPTION" as FormatType;
    }
  };

  const options = [
    { id: "table", label: "Table Format" },
    { id: "description", label: "Description Format" },
    { id: "image_pdf", label: "Image PDF Format" },
  ];

  const openItemModal = (tableId: number) => {
    setActiveTableId(tableId);
    setIsOpen(true);
  };

  const openMarkupPicker = (tableId: number, itemId: string) => {
    setActiveMarkupItem({ id: itemId, tableId });
    setAddMarkUp(true);
  };

  const openTaxPicker = (tableId: number, itemId: string) => {
    setActiveTaxItem({ id: itemId, tableId });
    setAddTax(true);
  };

  const addItemFromModal = () => {
    const fmt = mapSelectedToFormat(selected);
    setSelectedFormat(fmt);
    setIsOpen(false);
    setItemModalOpen(true);
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

  const [updateEstimate, { isLoading: isUpdatingEstimate }] =
    useEditEstimateMutation();

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
    contractId: "",
    date: "",
    endDate: "",
    poNumber: "",
    legendary: "",
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
  const [prefilledSummary, setPrefilledSummary] =
    useState<PrefilledSummary | null>(null);

  const [createClient, { isLoading }] = useCreateClientMutation();
  const [addContract, { isLoading: isAddingContract }] =
    useAddContractMutation();
  const [updateContract] = useUpdateContractMutation();
  const [deleteContract] = useDeleteContractMutation();
  const { data: allContractsData, refetch: refetchContracts } =
    useGetAllContractsQuery({});
  const contracts = allContractsData?.result?.data ?? [];

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

  useEffect(() => {
    if (queryEstimateId) {
      setEstimateId(queryEstimateId);
      if (typeof window !== "undefined") {
        localStorage.setItem("editingEstimateId", queryEstimateId);
      }
      return;
    }

    if (typeof window !== "undefined") {
      const storedEstimateId = localStorage.getItem("editingEstimateId") || "";
      if (storedEstimateId) {
        setEstimateId(storedEstimateId);
      }
    }
  }, [queryEstimateId]);

  const { data } = useGetMyClientsQuery({});
  const myClients = data?.result;

  const { data: allItem } = useGetAllItemsQuery({});
  const items = useMemo(() => allItem?.result ?? [], [allItem]);

  const { data: allMarkup, refetch } = useGetAllMarkupsQuery();
  const markups = allMarkup?.result ?? [];

  const { data: taxData, refetch: refetchTaxes } = useGetAllTaxesQuery({});
  const allTax = taxData?.result;

  const isVideoFile = (url: string) =>
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);

  const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const {
    data: estimateData,
    isLoading: isEstimateLoading,
    error: estimateError,
  } = useGetEstimateByIdQuery(estimateId, {
    skip: !estimateId,
  });

  const currentEstimate = estimateData?.result;

  useEffect(() => {
    if (!currentEstimate) return;

    const normalizedItems = Array.isArray(currentEstimate?.items)
      ? currentEstimate.items
      : Array.isArray(currentEstimate?.lineItems)
        ? currentEstimate.lineItems
        : [];

    const itemCatalog = Array.isArray(items) ? items : [];

    setEstimateForm((prev) => ({
      ...prev,
      estimateName: currentEstimate?.estimateName || "",
      clientId: currentEstimate?.clientId || "",
      date: currentEstimate?.date || "",
      endDate: currentEstimate?.endDate || "",
      poNumber: currentEstimate?.poNumber || "",
      contractId: currentEstimate?.contractId || "",
      additionalMarkUp: Number(currentEstimate?.additionalMarkUp || 0),
      grandTotal: Number(currentEstimate?.grandTotal || 0),
      discountAmount: Number(currentEstimate?.discountAmount || 0),
      depositAmount: Number(currentEstimate?.depositAmount || 0),
      format: currentEstimate?.format || "TABLE",
    }));

    setDiscount(null);
    setDeposit(null);
    setSelectedMarkup(null);

    setLineItemTables([
      {
        id: Date.now(),
        format: (currentEstimate?.format || "TABLE") as FormatType,
        items:
          normalizedItems.length > 0
            ? normalizedItems.map((item: any, index: number) => {
                const apiItemId =
                  item?.itemId ||
                  item?.item?.id ||
                  item?.item?._id ||
                  item?.id ||
                  item?._id;
                const catalogMatch = itemCatalog.find(
                  (catalogItem: any) =>
                    catalogItem?.id === apiItemId ||
                    catalogItem?._id === apiItemId ||
                    catalogItem?.id === item?.itemId ||
                    catalogItem?._id === item?.itemId,
                );

                const hasItemQuantity =
                  toNumber(item?.quantity) > 0 ||
                  toNumber(item?.qty) > 0 ||
                  toNumber(item?.item?.quantity) > 0;

                const quantity = hasItemQuantity
                  ? toNumber(item?.quantity) ||
                    toNumber(item?.qty) ||
                    toNumber(item?.item?.quantity) ||
                    0
                  : 1;

                const fallbackItemSubtotal =
                  toNumber(currentEstimate?.grandTotal) > 0
                    ? toNumber(currentEstimate?.grandTotal) /
                      Math.max(normalizedItems.length, 1)
                    : 0;

                const subTotal =
                  toNumber(item?.subTotal) ||
                  toNumber(item?.subtotal) ||
                  toNumber(item?.lineTotal) ||
                  toNumber(item?.total) ||
                  toNumber(item?.item?.subTotal) ||
                  fallbackItemSubtotal;
                const fallbackRate =
                  quantity > 0 && subTotal > 0 ? subTotal / quantity : 0;

                const rate =
                  toNumber(item?.rate) ||
                  toNumber(item?.unitCost) ||
                  toNumber(item?.price) ||
                  toNumber(item?.amount) ||
                  toNumber(item?.item?.rate) ||
                  toNumber(catalogMatch?.rate) ||
                  toNumber(catalogMatch?.markUp?.amount) ||
                  toNumber(catalogMatch?.amount) ||
                  toNumber(item?.markUp) ||
                  fallbackRate;

                const markupPercent =
                  toNumber(item?.percentage) ||
                  toNumber(item?.markUpPercentage) ||
                  toNumber(item?.markupPercentage) ||
                  toNumber(item?.item?.markUpPercentage) ||
                  toNumber(catalogMatch?.markUp?.percentage) ||
                  toNumber(catalogMatch?.percentage) ||
                  0;

                const taxPercent =
                  toNumber(item?.tax) ||
                  toNumber(item?.taxPercentage) ||
                  toNumber(item?.item?.taxPercentage) ||
                  toNumber(item?.tax?.percentage) ||
                  toNumber(catalogMatch?.tax?.percentage) ||
                  0;

                const lineTotal =
                  subTotal > 0
                    ? subTotal
                    : rate *
                      quantity *
                      (1 + markupPercent / 100) *
                      (1 + taxPercent / 100);

                return {
                  id: `${Date.now()}-${index}`,
                  description:
                    item?.description || catalogMatch?.description || "",
                  itemName:
                    item?.itemName ||
                    item?.item?.itemName ||
                    catalogMatch?.itemName ||
                    item?.description ||
                    catalogMatch?.description ||
                    "",
                  markUp: Number(
                    item?.markUp || catalogMatch?.markUp?.amount || 0,
                  ),
                  quantity,
                  tax: taxPercent,
                  total: lineTotal,
                  percentage: markupPercent,
                  amount: toNumber(item?.amount || catalogMatch?.amount || 0),
                  rate,
                  format:
                    item?.format ||
                    (currentEstimate?.format as FormatType) ||
                    "TABLE",
                  originalItem: {
                    id:
                      apiItemId ||
                      item?.itemId ||
                      item?.item?.id ||
                      item?.item?._id,
                    _id:
                      apiItemId ||
                      item?.itemId ||
                      item?.item?.id ||
                      item?.item?._id,
                    itemId:
                      item?.itemId ||
                      item?.item?.id ||
                      item?.item?._id ||
                      apiItemId,
                  },
                };
              })
            : [
                {
                  id: Date.now().toString(),
                  description: "",
                  itemName: "",
                  markUp: 0,
                  quantity: 0,
                  tax: 0,
                  total: 0,
                  percentage: 0,
                  amount: 0,
                  rate: 0,
                  format: (currentEstimate?.format as FormatType) || "TABLE",
                },
              ],
      },
    ]);

    const sideMapSource = Array.isArray(currentEstimate?.sideMap)
      ? currentEstimate.sideMap
      : currentEstimate?.sideMap
        ? [currentEstimate.sideMap]
        : [];

    const imageSource = Array.isArray(currentEstimate?.fileUrls)
      ? currentEstimate.fileUrls
      : [];

    setExistingSideMapUrls(sideMapSource);
    setExistingImageUrls(imageSource);

    const subtotal = normalizedItems.reduce((sum: number, item: any) => {
      const qty =
        toNumber(item?.quantity) ||
        toNumber(item?.qty) ||
        toNumber(item?.item?.quantity) ||
        1;
      const rowSubtotal =
        toNumber(item?.subTotal) ||
        toNumber(item?.subtotal) ||
        toNumber(item?.lineTotal) ||
        toNumber(item?.total) ||
        (toNumber(item?.rate) || toNumber(item?.amount)) * qty;
      return sum + rowSubtotal;
    }, 0);

    const resolvedSubtotal =
      subtotal > 0 ? subtotal : toNumber(currentEstimate?.grandTotal);

    setPrefilledSummary({
      subtotal: resolvedSubtotal,
      markupAmount: Number(currentEstimate?.additionalMarkUp || 0),
      discountAmount: Number(currentEstimate?.discountAmount || 0),
      depositAmount: Number(currentEstimate?.depositAmount || 0),
      grandTotal: Number(currentEstimate?.grandTotal || 0),
    });
  }, [currentEstimate, items]);

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

      const newContractId = res?.result?.id || res?.id || "";
      if (newContractId) {
        setEstimateForm((prev) => ({ ...prev, contractId: newContractId }));
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
      toast.success("Contract deleted");
      await refetchContracts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete contract");
    }
  };

  useEffect(() => {
    if (!myClients?.length || !currentEstimate?.clientId) return;

    const matchedClient = myClients.find(
      (client: any) => client.id === currentEstimate.clientId,
    );

    if (matchedClient) {
      setSelectedClient(matchedClient);
    }
  }, [myClients, currentEstimate?.clientId]);

  const grandSubtotal = lineItemTables.reduce((acc, table) => {
    return (
      acc +
      table.items.reduce((tAcc, item) => {
        const rate = Number(item.rate ?? item.amount ?? item.markUp ?? 0) || 0;
        const qty = Number(item.quantity) || 0;
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
            quantity: 0,
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

  const hasSummaryOverride =
    selectedMarkup !== null || discount !== null || deposit !== null;

  const displaySubtotal = hasSummaryOverride
    ? grandSubtotal
    : (prefilledSummary?.subtotal ?? grandSubtotal);

  const displayGrandTotal = hasSummaryOverride
    ? calculateFinalTotal()
    : (prefilledSummary?.grandTotal ?? calculateFinalTotal());

  const handleToggleItem = (item: any) => {
    if (!activeTableId) return;

    const currentSelectedItemId = selectedItemsByTable[activeTableId];
    const isSelectingSameItem = currentSelectedItemId === item.id;

    setLineItemTables((prev) =>
      prev.map((table) => {
        if (table.id !== activeTableId) return table;

        const selectedRate =
          Number(item?.rate ?? item?.markUp?.amount ?? item?.amount ?? 0) || 0;

        const newItem = {
          id: Date.now().toString(),
          description: item.description ?? "",
          itemName: item.itemName,
          amount: item?.markUp?.amount ?? 0,
          percentage: item?.markUp?.percentage ?? 0,
          quantity: 1,
          tax: 0,
          rate: selectedRate,
          markUp: item?.markUp?.amount ?? 0,
          total: 0,
          originalItem: item,
          format: selectedFormat,
        };

        const updatedItems = isSelectingSameItem ? [] : [newItem];

        return {
          ...table,
          items: updatedItems,
        };
      }),
    );

    setSelectedItemsByTable((prev) => {
      if (isSelectingSameItem) {
        const next = { ...prev };
        delete next[activeTableId];
        return next;
      }

      return {
        ...prev,
        [activeTableId]: item.id,
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSideMapFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setSideMaps((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeSideMap = (index: number) => {
    setSideMaps((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingSideMap = (index: number) => {
    setExistingSideMapUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    setImages((prev) => [...prev, ...Array.from(fileList)]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOpenModal = (type: "markup" | "discount" | "deposit") => {
    setModalType(type);

    if (type === "discount") {
      if (discount !== null) {
        setTempValue(discount);
      } else if (
        (prefilledSummary?.discountAmount || 0) > 0 &&
        displaySubtotal > 0
      ) {
        setTempValue(
          (prefilledSummary!.discountAmount / displaySubtotal) * 100,
        );
      } else {
        setTempValue(0);
      }
    } else if (type === "deposit") {
      if (deposit !== null) {
        setTempValue(deposit);
      } else {
        const baseForDeposit =
          displaySubtotal - Number(prefilledSummary?.discountAmount || 0);
        if ((prefilledSummary?.depositAmount || 0) > 0 && baseForDeposit > 0) {
          setTempValue(
            (prefilledSummary!.depositAmount / baseForDeposit) * 100,
          );
        } else {
          setTempValue(0);
        }
      }
    } else {
      setTempValue(0);
    }

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

  const handleUpdateEstimate = async () => {
    try {
      const resolveLineItemId = (item: any) => {
        const directId =
          item?.originalItem?._id ||
          item?.originalItem?.id ||
          item?.originalItem?.itemId ||
          item?.originalItem?.item?._id ||
          item?.originalItem?.item?.id ||
          item?.itemId ||
          item?.item?._id ||
          item?.item?.id;

        if (directId) return String(directId);

        const catalogMatch = items.find((catalogItem: any) => {
          const namesMatch =
            catalogItem?.itemName === item?.itemName ||
            catalogItem?.description === item?.description;
          return namesMatch;
        });

        return (
          catalogMatch?.id || catalogMatch?._id || catalogMatch?.itemId || ""
        );
      };

      const calculateItemTotal = (item: any) => {
        const rate = Number(item.rate ?? item.amount ?? item.markUp ?? 0) || 0;
        const base = rate * (Number(item.quantity) || 0);
        const markupAmount = (base * (Number(item.percentage) || 0)) / 100;
        const afterMarkup = base + markupAmount;
        const taxAmount = (afterMarkup * (Number(item.tax) || 0)) / 100;
        return afterMarkup + taxAmount;
      };

      const markupAmount = selectedMarkup
        ? (grandSubtotal * selectedMarkup.percentage) / 100
        : 0;
      const subtotalAfterMarkup = grandSubtotal + markupAmount;
      const discountAmountCalc = discount
        ? (subtotalAfterMarkup * discount) / 100
        : 0;
      const subtotalAfterDiscount = subtotalAfterMarkup - discountAmountCalc;
      const depositAmountCalc = deposit
        ? (subtotalAfterDiscount * deposit) / 100
        : 0;

      const submittedItems = lineItemTables.flatMap((table) =>
        table.items
          .filter((item) => Number(item.quantity) > 0)
          .map((item) => ({
            id: resolveLineItemId(item),
            quantity: Number(item.quantity) || 0,
            subTotal: Math.round(calculateItemTotal(item)),
            format: table.format,
          })),
      );

      if (!submittedItems.length) {
        toast.error("Please add at least one item before updating.");
        return;
      }

      const hasMissingItemId = submittedItems.some((item) => !item.id);
      if (hasMissingItemId) {
        toast.error("Please reselect item(s) from Item List and try again.");
        return;
      }

      const bodyData = {
        estimateName: estimateForm.estimateName,
        clientId: selectedClient?.id || currentEstimate?.clientId,
        contractId:
          estimateForm.contractId || currentEstimate?.contractId || "",
        date: estimateForm.date,
        endDate: estimateForm.endDate,
        poNumber: estimateForm.poNumber,
        legendary: estimateForm.legendary,
        items: submittedItems,

        additionalMarkUp: Math.round(markupAmount),
        discountAmount: Math.round(discountAmountCalc),
        depositAmount: Math.round(depositAmountCalc),

        grandTotal: Math.round(calculateFinalTotal()),
        sideMap: existingSideMapUrls,
        fileUrls: existingImageUrls,
      };

      const formData = new FormData();
      formData.append("bodyData", JSON.stringify(bodyData));

      sideMaps.forEach((file) => {
        formData.append("map", file);
      });

      images.forEach((file) => {
        formData.append("urls", file);
      });

      await updateEstimate({ id: estimateId, data: formData }).unwrap();

      toast.success("Estimate updated successfully");
      router.push(`/admin/estimate/${estimateId}?format=${detailsFormat}`);
    } catch (err: any) {
      console.error("Estimate update error:", err);
      toast.error(err?.data?.message || "Failed to update estimate");
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

      setAddTax(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create tax");
    }
  };

  // Helper function to calculate line item total (includes markup and tax)
  const calculateLineTotal = (item: any) => {
    const rate = Number(item.rate ?? item.amount ?? item.markUp ?? 0) || 0;
    const quantity = Number(item.quantity) || 0;
    const base = rate * quantity;
    const markupAmount = (base * (Number(item.percentage) || 0)) / 100;
    const afterMarkup = base + markupAmount;
    const taxAmount = (afterMarkup * (Number(item.tax) || 0)) / 100;
    return afterMarkup + taxAmount;
  };

  if (isEstimateLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ColorRing
          visible={true}
          height="70"
          width="70"
          colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
        />
      </div>
    );
  }

  if (!estimateId) {
    return (
      <div className="p-4 space-y-3">
        <p className="text-red-500">Estimate ID is missing.</p>
        <Link href="/admin/estimate" className="text-primary hover:underline">
          Back To Estimate List Page
        </Link>
      </div>
    );
  }

  if (estimateError || !currentEstimate) {
    return (
      <div className="p-4 space-y-3">
        <p className="text-red-500">Failed to load estimate details.</p>
        <Link href="/admin/estimate" className="text-primary hover:underline">
          Back To Estimate List Page
        </Link>
      </div>
    );
  }

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
            onClick={handleUpdateEstimate}
            disabled={isUpdatingEstimate}
            className="px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Update Estimate
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
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
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
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
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
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
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
              className="w-full mt-1 border rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-gray-600">Contract</label>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => setAddContractModalOpen(true)}
              className="flex-1 text-left rounded-lg border px-4 py-2 bg-white"
            >
              {contracts.find((c: any) => c.id === estimateForm.contractId)
                ?.title || "Select Contract"}
            </button>
            <button
              onClick={() => setAddContractModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-primary text-white"
            >
              Manage
            </button>
          </div>
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
          {lineItemTables.map((table, index) => (
            <div key={table.id} className="mt-3 w-full">
              <div className="mt-8">
                {index === 0 && (
                  <div className="hidden md:grid md:grid-cols-6 text-base text-center font-semibold border-b pb-2 ml-8">
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
                  const quantity = Number(item.quantity) || 0;
                  const total =
                    toNumber(item.total) > 0
                      ? toNumber(item.total)
                      : calculateLineTotal(item);

                  const handleRemoveLineItem = () => {
                    setLineItemTables((prev) =>
                      prev
                        .map((t) =>
                          t.id === table.id
                            ? {
                                ...t,
                                items: t.items.filter((i) => i.id !== item.id),
                              }
                            : t,
                        )
                        .filter((t) => t.items.length > 0),
                    );
                  };

                  return (
                    <div key={item.id} className="relative mt-3 pl-8 md:pl-10">
                      <button
                        type="button"
                        onClick={handleRemoveLineItem}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#E45C38] text-white flex items-center justify-center hover:bg-[#cf4f2f] transition-colors"
                        aria-label="Remove line item"
                      >
                        <Minus size={14} strokeWidth={3} />
                      </button>

                      <div className="border rounded-xl overflow-hidden">
                        {/* Row */}
                        <div className="grid grid-cols-1 md:grid-cols-6 border">
                          <div className="col-span-1 md:col-span-1 border-r md:border-r p-2 text-sm text-gray-500 text-left">
                            <label className="block md:hidden font-medium mb-1">
                              Description
                            </label>
                            <div className="flex items-center justify-between border-b md:border-b-0 p-2 md:p-0">
                              <span className="hidden md:inline">
                                {item.itemName || "Description"}
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
                          <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0 md:p-0 text-center">
                            <label className="block md:hidden text-sm font-medium mb-1 ">
                              Rate
                            </label>
                            <input
                              className="cell w-full text-center focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition p-2 "
                              placeholder="$0.00"
                              value={rate}
                              onChange={(e) => {
                                const newRate = parseFloat(e.target.value) || 0;
                                setLineItemTables((prev) =>
                                  prev.map((t) =>
                                    t.id === table.id
                                      ? {
                                          ...t,
                                          items: t.items.map((i) =>
                                            i.id === item.id
                                              ? {
                                                  ...i,
                                                  rate: newRate,
                                                  total: 0,
                                                }
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
                          <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0 md:p-0 text-center">
                            <label className="block md:hidden text-sm font-medium mb-1">
                              Markup
                            </label>
                            <input
                              className="cell cursor-pointer bg-white/90 w-full text-center p-2 focus:outline-none"
                              placeholder="Markup"
                              value={`${toNumber(item.percentage)}%`}
                              readOnly
                              onClick={() =>
                                openMarkupPicker(table.id, item.id)
                              }
                            />
                          </div>

                          {/* Quantity */}
                          <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0 md:p-0 text-center">
                            <label className="block md:hidden text-sm font-medium mb-1">
                              Quantity
                            </label>
                            <input
                              className="cell w-full text-center focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition p-2"
                              placeholder="0"
                              value={quantity}
                              onChange={(e) => {
                                const parsedQuantity = parseFloat(
                                  e.target.value,
                                );
                                const newQuantity = Number.isNaN(parsedQuantity)
                                  ? 0
                                  : parsedQuantity;
                                setLineItemTables((prev) =>
                                  prev.map((t) =>
                                    t.id === table.id
                                      ? {
                                          ...t,
                                          items: t.items.map((i) =>
                                            i.id === item.id
                                              ? {
                                                  ...i,
                                                  quantity: newQuantity,
                                                  total: 0,
                                                }
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
                          <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0 md:p-0 text-center">
                            <label className="block md:hidden text-sm font-medium mb-1">
                              Tax
                            </label>
                            <input
                              className="cell w-full text-center p-2 focus:outline-none cursor-pointer focus:ring-1 focus:ring-primary focus:border-primary transition"
                              placeholder="Tax"
                              value={`${toNumber(item.tax)}%`}
                              readOnly
                              onClick={() => openTaxPicker(table.id, item.id)}
                            />
                          </div>

                          {/* Total */}
                          <div className="md:col-span-1 p-2 text-center">
                            <label className="block md:hidden text-sm font-medium mb-1">
                              Total
                            </label>
                            <input
                              className="cell w-full text-center p-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition  "
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
                              {/* <p className="text-sm font-semibold">
                                {item.itemName}
                              </p> */}

                              {item.description && (
                                <p className="text-xs text-gray-500">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
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
              <span className="text-primary font-medium">Click to upload</span>{" "}
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

          {existingSideMapUrls.length > 0 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {existingSideMapUrls.map((url, idx) => (
                <div key={`${url}-${idx}`} className="relative">
                  {isVideoFile(url) ? (
                    <video
                      src={url}
                      controls
                      className="rounded-lg object-cover w-[120px] h-[120px] bg-black"
                    />
                  ) : (
                    <Image
                      src={url}
                      alt="existing side map"
                      width={120}
                      height={120}
                      unoptimized
                      className="rounded-lg object-cover w-[120px] h-[120px]"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => removeExistingSideMap(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
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
            className="mt-2 border-2 border-dashed border-primary rounded-xl  flex flex-col items-center justify-center cursor-pointer bg-orange-50 p-12"
          >
            <Upload className="text-gray-400 mb-2" size={24} />
            <p className="text-lg text-gray-600 ">
              <span className="text-primary font-medium">Click to upload</span>{" "}
              or drag & drop
            </p>
          </label>

          <div className="flex gap-3 mt-4 flex-wrap">
            {existingImageUrls.map((url, idx) => (
              <div key={`${url}-${idx}`} className="relative">
                {isVideoFile(url) ? (
                  <video
                    src={url}
                    controls
                    className="rounded-lg object-cover w-[120px] h-[120px] bg-black"
                  />
                ) : (
                  <Image
                    src={url}
                    alt="existing file"
                    width={120}
                    height={120}
                    unoptimized
                    className="rounded-lg object-cover w-[120px] h-[120px]"
                  />
                )}

                <button
                  type="button"
                  onClick={() => removeExistingImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2"
                >
                  x
                </button>
              </div>
            ))}

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

        <div className="mt-6 flex justify-end">
          <div className="w-[356px] flex flex-col space-y-3">
            <div className="flex justify-between items-center border-b py-1">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="font-semibold text-gray-900">
                ${displaySubtotal.toFixed(2)}
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
              ) : !hasSummaryOverride &&
                (prefilledSummary?.markupAmount || 0) > 0 ? (
                <span
                  onClick={() => setTotalAddMarkup(true)}
                  className="font-semibold text-gray-900 cursor-pointer"
                >
                  ${Number(prefilledSummary?.markupAmount || 0).toFixed(2)}
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
              ) : !hasSummaryOverride &&
                (prefilledSummary?.discountAmount || 0) > 0 ? (
                <span
                  className="font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleOpenModal("discount")}
                >
                  ${Number(prefilledSummary?.discountAmount || 0).toFixed(2)}
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
              ) : !hasSummaryOverride &&
                (prefilledSummary?.depositAmount || 0) > 0 ? (
                <span
                  className="font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleOpenModal("deposit")}
                >
                  ${Number(prefilledSummary?.depositAmount || 0).toFixed(2)}
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
                ${displayGrandTotal.toFixed(2)}
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

        {/* add line items MODAL */}
        <CustomModal
          open={isOpen}
          onClose={() => setIsOpen(false)}
          title="Add Line item"
          actions={[
            {
              label: "Close",
              variant: "secondary",
              onClick: () => setIsOpen(false),
            },
            {
              label: "Add Line",
              variant: "primary",
              onClick: addItemFromModal,
            },
          ]}
        >
          <div className="space-y-3">
            {options.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelected(item.id)}
                className="flex items-center justify-between border rounded-lg p-3 cursor-pointer"
              >
                <input
                  type="text"
                  readOnly
                  value={item.label}
                  className="w-full bg-transparent outline-none cursor-pointer"
                />

                <div className="w-5 h-5 flex items-center justify-end">
                  {selected === item.id && (
                    <Check
                      className="text-white bg-primary rounded-full p-1"
                      size={20}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
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
          onClick={handleUpdateEstimate}
          className="px-5 py-2 md:hidden rounded-lg bg-primary text-white hover:bg-primary/90 w-full transition-colors"
        >
          Update
        </button>
      </div>

      {addMarkUp && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
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
                                    total: 0,
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
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
                                    total: 0,
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
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50
        p-4"
        >
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
              className="w-full border p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
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
              className="w-full border p-2 rounded focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
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
                  className="w-full border border-gray-300 p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
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
