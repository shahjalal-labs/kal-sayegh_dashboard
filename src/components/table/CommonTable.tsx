import {
  useCreateMarkupMutation,
  useCreateTaxMutation,
  useGetAllItemsQuery,
  useGetAllMarkupsQuery,
  useGetAllTaxesQuery,
} from "@/redux/api/admin/estimateApi";
import { FormatType } from "@/types/estimate.type";
import { Check, Minus, Plus, PlusIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CustomModal } from "../modal/CustomModal";

export default function CommonTable({
  onDataChange,
  initialItems,
}: {
  onDataChange?: (data: any) => void;
  initialItems?: any[];
}) {
  const [items, setItems] = useState<{ id: number; format: FormatType }[]>([]);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FormatType | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);

  // Sub-items states
  const [activeSubItemRowId, setActiveSubItemRowId] = useState<number | null>(
    null,
  );
  const [subItemsByRow, setSubItemsByRow] = useState<Record<number, any[]>>({});
  const [subItemTitle, setSubItemTitle] = useState("");
  const [subItemQty, setSubItemQty] = useState("");
  const [subItemUnitCost, setSubItemUnitCost] = useState("");

  const handleAddSubItem = () => {
    if (activeSubItemRowId === null) return;
    if (!subItemTitle.trim()) {
      toast.error("Please enter a title for the sub-item.");
      return;
    }
    const qty = parseFloat(subItemQty) || 0;
    const unitCost = parseFloat(subItemUnitCost) || 0;
    if (qty <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }
    if (unitCost <= 0) {
      toast.error("Unit cost must be greater than 0.");
      return;
    }

    const newSubItem = {
      title: subItemTitle.trim(),
      quantity: qty,
      unitCost: unitCost,
      price: qty * unitCost,
    };

    setSubItemsByRow((prev) => ({
      ...prev,
      [activeSubItemRowId]: [...(prev[activeSubItemRowId] || []), newSubItem],
    }));

    // Reset inputs
    setSubItemTitle("");
    setSubItemQty("");
    setSubItemUnitCost("");
  };

  const handleRemoveSubItem = (rowId: number, index: number) => {
    setSubItemsByRow((prev) => ({
      ...prev,
      [rowId]: (prev[rowId] || []).filter((_, i) => i !== index),
    }));
  };
  const [activeTableId, setActiveTableId] = useState<number | null>(null);
  const [selectedItemsByTable, setSelectedItemsByTable] = useState<
    Record<number, any>
  >({});

  const [openCreateMarkupModal, setOpenCreateMarkupModal] = useState(false);
  const [markupValue, setMarkupValue] = useState({ name: "", percentage: "" });

  const { data } = useGetAllItemsQuery({});
  const allItems = data?.result ?? [];

  const { data: allMarkup } = useGetAllMarkupsQuery();
  const markups = allMarkup?.result ?? [];

  const { data: allTax } = useGetAllTaxesQuery({});
  const taxes = allTax?.result ?? [];

  const [createMarkup] = useCreateMarkupMutation();
  const [createTax] = useCreateTaxMutation();

  const [markupModalOpen, setMarkupModalOpen] = useState(false);
  const [activeMarkupRowId, setActiveMarkupRowId] = useState<number | null>(
    null,
  );
  const [selectedMarkupsByRow, setSelectedMarkupsByRow] = useState<
    Record<number, any>
  >({});

  const [addTax, setAddTax] = useState(false);
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [taxValue, setTaxValue] = useState({ name: "", percentage: "" });
  const [activeTaxRowId, setActiveTaxRowId] = useState<number | null>(null);
  const [selectedTaxesByRow, setSelectedTaxesByRow] = useState<
    Record<number, any>
  >({});

  const [rowData, setRowData] = useState<
    Record<number, { rate: string; quantity: string }>
  >({});

  const [summaryMarkup, setSummaryMarkup] = useState<any>(null);
  const [summaryTax, setSummaryTax] = useState<any>(null);
  const [summaryDiscount, setSummaryDiscount] = useState<{
    value: number;
    unit: "percent" | "dollar";
  } | null>(null);
  const [summaryDeposit, setSummaryDeposit] = useState<{
    value: number;
    unit: "percent" | "dollar";
  } | null>(null);

  useEffect(() => {
    if (!initialItems?.length || items.length > 0) return;

    const fallbackRowIdBase = Date.now();

    const seededRows = initialItems.map((item: any, index: number) => {
      const rowId = item?.rowId ?? item?.id ?? fallbackRowIdBase + index;
      const selectedItem = item?.selectedItem ?? item ?? null;
      const format = String(
        item?.format ?? selectedItem?.format ?? "DESCRIPTION",
      ).toUpperCase() as FormatType;

      return {
        id: rowId,
        format,
      };
    });

    const seededSelectedItems: Record<number, any> = {};
    const seededRowData: Record<number, { rate: string; quantity: string }> =
      {};
    const seededMarkups: Record<number, any> = {};
    const seededTaxes: Record<number, any> = {};

    const seededSubItems: Record<number, any[]> = {};
    initialItems.forEach((item: any, index: number) => {
      const rowId = item?.rowId ?? item?.id ?? fallbackRowIdBase + index;
      const selectedItem = item?.selectedItem ?? item ?? null;

      seededSelectedItems[rowId] = selectedItem;
      seededRowData[rowId] = {
        rate: String(
          item?.rate ?? selectedItem?.rate ?? selectedItem?.amount ?? 0,
        ),
        quantity: String(item?.quantity ?? 1),
      };
      seededMarkups[rowId] = item?.selectedMarkup ?? null;
      seededTaxes[rowId] = item?.selectedTax ?? null;

      if (Array.isArray(item?.subItems)) {
        seededSubItems[rowId] = item.subItems.map((sub: any) => ({
          title: sub.title,
          quantity: Number(sub.quantity) || 0,
          unitCost: Number(sub.unitCost) || 0,
          price: Number(sub.price || sub.quantity * sub.unitCost) || 0,
        }));
      }
    });

    setItems(seededRows);
    setSelectedItemsByTable(seededSelectedItems);
    setRowData(seededRowData);
    setSelectedMarkupsByRow(seededMarkups);
    setSelectedTaxesByRow(seededTaxes);
    setSubItemsByRow(seededSubItems);
  }, [initialItems, items.length]);

  const [markupSummaryModal, setMarkupSummaryModal] = useState(false);
  const [taxSummaryModal, setTaxSummaryModal] = useState(false);
  const [discountModal, setDiscountModal] = useState(false);
  const [depositModal, setDepositModal] = useState(false);

  const formatOptions = [
    { id: "DESCRIPTION", label: "Description" },
    { id: "TABLE", label: "Table Format" },
    { id: "IMAGE_PDF", label: "Upload Picture, PDF, Document" },
  ] as const;

  const mapSelectedToFormat = (sel: string): FormatType => {
    switch ((sel || "").toLowerCase()) {
      case "table":
        return "TABLE";
      case "upload picture, pdf, document":
      case "image_pdf":
        return "IMAGE_PDF";
      case "description":
      default:
        return "DESCRIPTION";
    }
  };

  const getRowFormat = (rowId: number): FormatType => {
    return items.find((item) => item.id === rowId)?.format || "DESCRIPTION";
  };

  const getFormatLabel = (format: FormatType) => {
    switch (format) {
      case "TABLE":
        return "Table Format";
      case "IMAGE_PDF":
        return "Upload Picture, PDF, Document";
      case "DESCRIPTION":
      default:
        return "Description";
    }
  };

  const getItemsByFormat = (format: FormatType) => {
    return allItems.filter((item: any) => {
      const itemFormat = String(item?.format || "DESCRIPTION").toUpperCase();
      return itemFormat === format;
    });
  };

  const openItemModal = (tableId: number) => {
    setActiveTableId(tableId);
    setItemModalOpen(true);
  };

  const handleToggleItem = (item: any) => {
    if (activeTableId === null) return;

    const isDeselecting = selectedItemsByTable[activeTableId]?.id === item.id;

    setSelectedItemsByTable((prev) => ({
      ...prev,
      [activeTableId]: isDeselecting ? null : item,
    }));

    setRowData((prev) => ({
      ...prev,
      [activeTableId]: {
        ...prev[activeTableId],
        rate: isDeselecting ? "" : String(item?.rate ?? item?.amount ?? 0),
        quantity: isDeselecting ? "0" : "1",
      },
    }));
  };

  const addLine = (format: FormatType) => {
    setItems((prev) => [...prev, { id: Date.now(), format }]);
    setFormatModalOpen(false);
  };

  const removeLine = (lineId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== lineId));

    setRowData((prev) => {
      const next = { ...prev };
      delete next[lineId];
      return next;
    });

    setSelectedItemsByTable((prev) => {
      const next = { ...prev };
      delete next[lineId];
      return next;
    });

    setSelectedMarkupsByRow((prev) => {
      const next = { ...prev };
      delete next[lineId];
      return next;
    });

    setSelectedTaxesByRow((prev) => {
      const next = { ...prev };
      delete next[lineId];
      return next;
    });

    setSubItemsByRow((prev) => {
      const next = { ...prev };
      delete next[lineId];
      return next;
    });

    setActiveMarkupRowId((prev) => (prev === lineId ? null : prev));
    setActiveTaxRowId((prev) => (prev === lineId ? null : prev));
    setActiveTableId((prev) => (prev === lineId ? null : prev));
  };

  const openMarkupPicker = (rowId: number) => {
    setActiveMarkupRowId(rowId);
    setMarkupModalOpen(true);
  };

  const handleSelectMarkup = (markup: any) => {
    if (activeMarkupRowId === null) return;
    setSelectedMarkupsByRow((prev) => ({
      ...prev,
      [activeMarkupRowId]: markup,
    }));
    setMarkupModalOpen(false);
  };

  const handleCreateMarkup = async () => {
    try {
      await createMarkup({
        name: markupValue.name,
        percentage: parseFloat(markupValue.percentage),
      }).unwrap();
      setOpenCreateMarkupModal(false);
      setMarkupValue({ name: "", percentage: "" });
    } catch (error) {
      console.error("Failed to create markup:", error);
    }
  };

  const openTaxPicker = (rowId: number) => {
    setActiveTaxRowId(rowId);
    setAddTax(true);
  };

  const handleSelectTax = (tax: any) => {
    if (activeTaxRowId === null) return;
    setSelectedTaxesByRow((prev) => ({ ...prev, [activeTaxRowId]: tax }));
    setAddTax(false);
  };

  const handleCreateTax = async () => {
    try {
      await createTax({
        name: taxValue.name,
        percentage: parseFloat(taxValue.percentage),
      }).unwrap();
      setTaxModalOpen(false);
      setTaxValue({ name: "", percentage: "" });
    } catch (error) {
      console.error("Failed to create tax:", error);
    }
  };

  const handleSelectSummaryMarkup = (markup: any) => {
    setSummaryMarkup(markup);
    setMarkupSummaryModal(false);
  };

  const handleSelectSummaryTax = (tax: any) => {
    setSummaryTax(tax);
    setTaxSummaryModal(false);
  };

  const updateQuantity = (rowId: number, nextQuantity: number) => {
    const safeQuantity = Math.max(0, nextQuantity);

    setRowData((prev) => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        quantity: String(safeQuantity),
      },
    }));
  };

  const incrementQuantity = (rowId: number) => {
    const currentQuantity = parseFloat(rowData[rowId]?.quantity || "0") || 0;
    updateQuantity(rowId, currentQuantity + 1);
  };

  const decrementQuantity = (rowId: number) => {
    const currentQuantity = parseFloat(rowData[rowId]?.quantity || "0") || 0;
    updateQuantity(rowId, currentQuantity - 1);
  };

  // Provide data to parent
  useEffect(() => {
    if (onDataChange) {
      const itemsData = items.map((item) => {
        const rate = parseFloat(rowData[item.id]?.rate || "0") || 0;
        const quantity = parseFloat(rowData[item.id]?.quantity || "0") || 0;
        const selectedItem = selectedItemsByTable[item.id];
        const selectedTax = selectedTaxesByRow[item.id] || null;
        const selectedMarkup = selectedMarkupsByRow[item.id];

        const markupValue = selectedMarkup
          ? selectedMarkup.percentage != null
            ? selectedMarkup.percentage
            : selectedMarkup.amount || 0
          : selectedItem?.markUp?.percentage != null
            ? selectedItem.markUp.percentage
            : selectedItem?.markUp?.amount || 0;
        const isMarkupPercentage = selectedMarkup
          ? selectedMarkup.percentage != null
          : selectedItem?.markUp?.percentage != null;

        const taxPercent = selectedTax?.percentage || 0;
        const base = rate * quantity;
        const markupAmount = isMarkupPercentage
          ? base * (markupValue / 100)
          : markupValue;
        const subtotal = base + markupAmount;
        const taxAmount = subtotal * (taxPercent / 100);
        const total = subtotal + taxAmount;
        const roundedTotal = Math.round(total);

        return {
          selectedItem,
          rate,
          quantity,
          selectedMarkup: selectedItem?.markUp
            ? { ...selectedItem.markUp, isPercentage: isMarkupPercentage }
            : null,
          selectedTax,
          taxPercent,
          taxAmount: Math.round(taxAmount),
          total: roundedTotal,
        };
      });

      const allSubItems: any[] = [];
      let subItemsSubtotal = 0;

      items.forEach((item) => {
        const rowSubItems = subItemsByRow[item.id] || [];
        const selectedItem = selectedItemsByTable[item.id];
        const itemId = selectedItem?.id || selectedItem?._id || "";
        if (itemId) {
          rowSubItems.forEach((sub) => {
            subItemsSubtotal += sub.price;
            allSubItems.push({
              itemId,
              title: sub.title,
              quantity: sub.quantity,
              unitCost: sub.unitCost,
              price: sub.price,
            });
          });
        }
      });

      const itemsSubtotal = itemsData.reduce(
        (sum, item) => sum + item.total,
        0,
      );
      const combinedSubtotal = itemsSubtotal + subItemsSubtotal;

      let grandTotal = combinedSubtotal;
      if (summaryMarkup) {
        grandTotal += combinedSubtotal * (summaryMarkup.percentage / 100);
      }
      if (summaryTax) {
        grandTotal += combinedSubtotal * (summaryTax.percentage / 100);
      }
      if (summaryDiscount) {
        if (summaryDiscount.unit === "percent") {
          grandTotal -= grandTotal * (summaryDiscount.value / 100);
        } else {
          grandTotal -= summaryDiscount.value;
        }
      }
      if (summaryDeposit) {
        if (summaryDeposit.unit === "percent") {
          grandTotal += combinedSubtotal * (summaryDeposit.value / 100);
        } else {
          grandTotal += summaryDeposit.value;
        }
      }

      onDataChange({
        items: itemsData,
        subItems: allSubItems,
        summaryMarkup,
        summaryTax,
        summaryDiscount,
        summaryDeposit,
        grandTotal: Math.round(grandTotal),
      });
    }
  }, [
    items,
    rowData,
    selectedItemsByTable,
    selectedMarkupsByRow,
    selectedTaxesByRow,
    summaryMarkup,
    summaryTax,
    summaryDiscount,
    summaryDeposit,
    subItemsByRow,
    onDataChange,
  ]);

  return (
    <div>
      {/* Table */}
      <div className="mt-8">
        {items.length > 0 && (
          <>
            <div className="hidden md:grid md:grid-cols-6 text-base font-semibold border-b pb-2 ml-8">
              <p>Description</p>
              <p>Rate</p>
              <p>Markup</p>
              <p>Quantity</p>
              <p>Tax</p>
              <p>Total</p>
            </div>

            {items.map((item) => {
              const selectedItem = selectedItemsByTable[item.id];
              const rate = parseFloat(rowData[item.id]?.rate || "0") || 0;
              const quantity =
                parseFloat(rowData[item.id]?.quantity || "0") || 0;
              const selectedTax = selectedTaxesByRow[item.id] || null;
              const selectedMarkup = selectedMarkupsByRow[item.id];

              const markupValue = selectedMarkup
                ? selectedMarkup.percentage != null
                  ? selectedMarkup.percentage
                  : selectedMarkup.amount || 0
                : selectedItem?.markUp?.percentage != null
                  ? selectedItem.markUp.percentage
                  : selectedItem?.markUp?.amount || 0;
              const isMarkupPercentage = selectedMarkup
                ? selectedMarkup.percentage != null
                : selectedItem?.markUp?.percentage != null;
              const taxPercent = selectedTax?.percentage || 0;

              const base = rate * quantity;
              const markupAmount = isMarkupPercentage
                ? base * (markupValue / 100)
                : markupValue;
              const subtotal = base + markupAmount;
              const taxAmount = subtotal * (taxPercent / 100);
              const total = subtotal + taxAmount;

              return (
                <div key={item.id} className="relative mt-3 pl-8 md:pl-10">
                  <button
                    type="button"
                    onClick={() => removeLine(item.id)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#E45C38] text-white flex items-center justify-center hover:bg-[#cf4f2f] transition-colors"
                    aria-label="Remove line item"
                  >
                    <Minus size={14} strokeWidth={3} />
                  </button>

                  <div className="border rounded-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-6 border">
                      <div className="col-span-1 md:col-span-1 border-r md:border-r p-2 text-sm text-gray-500">
                        <label className="block md:hidden font-medium mb-1">
                          Description
                        </label>
                        <div className="flex items-center justify-between  border-b md:border-b-0 p-2 md:p-0">
                          <span className="hidden md:inline">
                            {selectedItem?.itemName || "Description"}
                          </span>
                          <span
                            onClick={() => openItemModal(item.id)}
                            className="text-orange-500 text-base cursor-pointer mt-3 md:mt-0"
                          >
                            Item List
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-gray-400 md:hidden">
                          {getFormatLabel(item.format)}
                        </p>
                      </div>

                      <div className="md:col-span-1 p-2 border-r  md:border-r border-b md:border-b-0  md:p-0 flex items-center ">
                        <label className="block md:hidden text-basefont-medium mb-1">
                          Rate
                        </label>
                        <input
                          className="cell w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition p-2"
                          placeholder="$0.00"
                          value={rowData[item.id]?.rate || ""}
                          readOnly
                          onChange={(e) =>
                            setRowData((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                rate: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>

                      <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0  md:p-0 flex items-center">
                        <label className="block md:hidden text-sm font-medium mb-1  ">
                          Markup
                        </label>
                        <input
                          className="cell bg-white/90 w-full p-2 hover:cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition"
                          placeholder="Markup"
                          value={
                            selectedMarkupsByRow[item.id]
                              ? selectedMarkupsByRow[item.id].percentage
                                ? `${selectedMarkupsByRow[item.id].percentage}%`
                                : `$${selectedMarkupsByRow[item.id].amount}`
                              : selectedItem?.markUp?.percentage != null
                                ? `${selectedItem.markUp.percentage}%`
                                : selectedItem?.markUp?.amount
                                  ? `$${selectedItem.markUp.amount}`
                                  : ""
                          }
                          readOnly
                        />
                      </div>

                      <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0  md:p-0 flex items-center">
                        <label className="block md:hidden text-sm font-medium mb-1">
                          Quantity
                        </label>
                        <div className="flex w-full items-center gap-2">
                          <input
                            type="number"
                            className="cell w-full focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition p-2 "
                            placeholder="0"
                            value={rowData[item.id]?.quantity ?? "0"}
                            onChange={(e) =>
                              updateQuantity(
                                item.id,
                                Number(e.target.value || 0),
                              )
                            }
                            min={0}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0  md:p-0 flex items-center">
                        <label className="block md:hidden text-sm font-medium mb-1">
                          Tax
                        </label>
                        <input
                          className="cell w-full p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition bg-white/90 cursor-pointer"
                          placeholder="Tax"
                          value={
                            selectedTax ? `${selectedTax.percentage}%` : ""
                          }
                          readOnly
                          onClick={() => openTaxPicker(item.id)}
                        />
                        <span
                          className="md:hidden text-orange-500 ml-2 cursor-pointer"
                          onClick={() => openTaxPicker(item.id)}
                        >
                          {selectedTax ? `${selectedTax.percentage}%` : "Add"}
                        </span>
                      </div>

                      <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0  md:p-0 flex items-center">
                        <label className="block md:hidden text-sm font-medium mb-1">
                          Total
                        </label>
                        <input
                          className="ell w-full p-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition bg-white/90"
                          placeholder="$0.00"
                          value={`$${total.toFixed(2)}`}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Notes inside same box */}
                    <div className="flex justify-between  pr-2">
                      <div className="border-t p-2">
                        {selectedItem ? (
                          <div className=" rounded-xl ">
                            <p className="mt-2 text-base text-gray-800 font-semibold">
                              {selectedItem.itemName}
                            </p>
                            {selectedItem.description && (
                              <p className="text-base text-gray-500 mt-1">
                                {selectedItem.description}
                              </p>
                            )}

                            {(subItemsByRow[item.id] || []).length > 0 && (
                              <div className="mt-4 w-full overflow-hidden rounded-xl border bg-white text-lg shadow-sm">
                                <div className="grid grid-cols-4 gap-3 border-b bg-gray-100 px-4 py-3 font-semibold">
                                  <div>Scope of Work</div>
                                  <div className="text-center">QTY</div>
                                  <div className="text-right">UNIT COST</div>
                                  <div className="text-right">PRICE</div>
                                </div>
                                {(() => {
                                  const rowSubItems =
                                    subItemsByRow[item.id] || [];
                                  const rowSubItemsTotal = rowSubItems.reduce(
                                    (acc, si) => {
                                      const q = Number(si.quantity) || 0;
                                      const u = Number(si.unitCost) || 0;
                                      return acc + q * u;
                                    },
                                    0,
                                  );
                                  const rowSubtotal = rowSubItemsTotal;

                                  return (
                                    <>
                                      {rowSubItems.map((si, idx) => {
                                        const q = Number(si.quantity) || 0;
                                        const u = Number(si.unitCost) || 0;
                                        const price = q * u;
                                        return (
                                          <div
                                            key={idx}
                                            className="grid grid-cols-4 items-center gap-3 border-t px-4 py-3"
                                          >
                                            <div className="truncate pr-2">
                                              {si.title}
                                            </div>
                                            <div className="text-center">
                                              {q}
                                            </div>
                                            <div className="text-right">
                                              ${u.toFixed(2)}
                                            </div>
                                            <div className="text-right">
                                              ${price.toFixed(2)}
                                            </div>
                                          </div>
                                        );
                                      })}

                                      <div className="flex items-center justify-end gap-3 border-t px-4 py-3 font-semibold">
                                        <span>Sub Total:</span>
                                        <span>${rowSubtotal.toFixed(2)}</span>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        ) : (
                          <textarea
                            placeholder="Notes"
                            className="w-full p-2 text-sm outline-none"
                          />
                        )}
                      </div>

                      <PlusIcon
                        size={30}
                        className={`cursor-pointer shrink-0 ${
                          selectedItem
                            ? "text-primary hover:text-primary/80"
                            : "text-gray-300 hover:text-gray-400"
                        }`}
                        onClick={() => {
                          if (!selectedItem) {
                            toast.error(
                              "Please select an item from the Item List first.",
                            );
                            return;
                          }
                          setActiveSubItemRowId(item.id);
                          setSubItemTitle("");
                          setSubItemQty("");
                          setSubItemUnitCost("");
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 flex justify-end border-t pt-3 pr-2 md:pr-0">
              {(() => {
                const globalSubtotal = items.reduce((acc, item) => {
                  const selectedItem = selectedItemsByTable[item.id];
                  const rate = parseFloat(rowData[item.id]?.rate || "0") || 0;
                  const quantity =
                    parseFloat(rowData[item.id]?.quantity || "0") || 0;
                  const selectedTax = selectedTaxesByRow[item.id] || null;
                  const selectedMarkup = selectedMarkupsByRow[item.id];

                  const markupValue = selectedMarkup
                    ? selectedMarkup.percentage != null
                      ? selectedMarkup.percentage
                      : selectedMarkup.amount || 0
                    : selectedItem?.markUp?.percentage != null
                      ? selectedItem.markUp.percentage
                      : selectedItem?.markUp?.amount || 0;
                  const isMarkupPercentage = selectedMarkup
                    ? selectedMarkup.percentage != null
                    : selectedItem?.markUp?.percentage != null;
                  const taxPercent = selectedTax?.percentage || 0;

                  const base = rate * quantity;
                  const markupAmount = isMarkupPercentage
                    ? base * (markupValue / 100)
                    : markupValue;
                  const subtotal = base + markupAmount;
                  const taxAmount = subtotal * (taxPercent / 100);
                  const total = subtotal + taxAmount;
                  const subItemsTotal = (subItemsByRow[item.id] || []).reduce(
                    (subAcc, si) => {
                      const q = Number(si.quantity) || 0;
                      const u = Number(si.unitCost) || 0;
                      return subAcc + q * u;
                    },
                    0,
                  );

                  return acc + total + subItemsTotal;
                }, 0);

                return (
                  <div className="inline-flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-2 text-base font-semibold text-gray-800">
                    <span>Sub Total:</span>
                    <span>${globalSubtotal.toFixed(2)}</span>
                  </div>
                );
              })()}
            </div>
          </>
        )}

        <button
          onClick={() => setFormatModalOpen(true)}
          className="mt-4 w-full border border-orange-400 text-orange-500 rounded-lg py-2 flex items-center justify-center md:justify-start p-4 gap-2"
        >
          <Plus size={16} /> Add Line Item
        </button>
      </div>

      <CustomModal
        open={formatModalOpen}
        maxWidth="md"
        onClose={() => {
          setFormatModalOpen(false);
          setSelectedFormat(null);
        }}
        title="Add Line Item"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => {
              setFormatModalOpen(false);
              setSelectedFormat(null);
            },
          },
          {
            label: "Add",
            variant: "primary",
            onClick: () => {
              if (selectedFormat) {
                addLine(selectedFormat);
                setSelectedFormat(null);
              }
            },
          },
        ]}
      >
        <div className="space-y-3">
          {formatOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                setSelectedFormat(option.id as unknown as FormatType)
              }
              className="w-full flex items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:border-orange-400 hover:bg-orange-50 transition"
            >
              <span className="font-medium text-gray-800">{option.label}</span>
              <div className="w-5 h-5 flex items-center justify-end">
                {selectedFormat === option.id && (
                  <Check
                    className="text-white bg-primary rounded-full p-1"
                    size={20}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </CustomModal>

      {/* Item picker modal */}
      <CustomModal
        open={itemModalOpen}
        onClose={() => setItemModalOpen(false)}
        title={`Item List - ${getFormatLabel(getRowFormat(activeTableId || 0))}`}
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
          {activeTableId === null ? (
            <p className="text-sm text-gray-500">Select a line item first.</p>
          ) : getItemsByFormat(getRowFormat(activeTableId)).length === 0 ? (
            <p className="text-sm text-gray-500">No items available.</p>
          ) : (
            getItemsByFormat(getRowFormat(activeTableId)).map((it: any) => {
              const isSelected =
                activeTableId !== null &&
                selectedItemsByTable[activeTableId]?.id === it.id;
              return (
                <div
                  key={it.id}
                  onClick={() => handleToggleItem(it)}
                  className={`flex justify-between items-start border p-3 rounded-xl cursor-pointer transition ${isSelected ? "bg-orange-50 border-orange-400" : "border-gray-200"}`}
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-800">{it.itemName}</p>
                    <p className="text-sm text-gray-500">{it.description}</p>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="font-semibold text-gray-800">
                      ${it?.rate || 0}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CustomModal>

      {/* Sub-Line Breakdown Items Modal */}
      <CustomModal
        open={activeSubItemRowId !== null}
        onClose={() => setActiveSubItemRowId(null)}
        title="Sub-Line Breakdown Items"
        maxWidth="md"
        actions={[
          {
            label: "Done",
            variant: "primary",
            onClick: () => setActiveSubItemRowId(null),
          },
        ]}
      >
        <div className="space-y-6">
          {/* Card Form */}
          <div className="bg-[#f0f2f5] p-4 rounded-xl space-y-3">
            <div>
              <input
                type="text"
                placeholder="Sub-item Title"
                value={subItemTitle}
                onChange={(e) => setSubItemTitle(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Qty"
                value={subItemQty}
                onChange={(e) => setSubItemQty(e.target.value)}
                className="w-24 bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
              <input
                type="number"
                placeholder="Unit Cost..."
                value={subItemUnitCost}
                onChange={(e) => setSubItemUnitCost(e.target.value)}
                className="flex-1 bg-white border border-primary/50 focus:border-primary rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
              <button
                type="button"
                onClick={handleAddSubItem}
                className="w-12 h-12 bg-[#e27932] text-white rounded-full flex items-center justify-center font-bold text-xl hover:bg-[#c9621f] transition-all shadow-md shrink-0"
              >
                +
              </button>
            </div>
          </div>

          {/* Sub-items List */}
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {activeSubItemRowId !== null &&
            (subItemsByRow[activeSubItemRowId] || []).length > 0 ? (
              (subItemsByRow[activeSubItemRowId] || []).map(
                (subItem, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm"
                  >
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {subItem.title}
                      </h4>
                      <p className="text-gray-500 text-xs mt-1">
                        Qty: {subItem.quantity} &times; Cost: $
                        {subItem.unitCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-800 text-sm">
                        ${subItem.price.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSubItem(activeSubItemRowId, index)
                        }
                        className="text-red-500 hover:text-red-700 transition"
                        aria-label="Delete sub-item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ),
              )
            ) : (
              <p className="text-center text-gray-400 text-sm py-4">
                No sub-items added yet.
              </p>
            )}
          </div>
        </div>
      </CustomModal>
    </div>
  );
}
