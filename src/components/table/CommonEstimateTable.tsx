import {
  useCreateMarkupMutation,
  useCreateTaxMutation,
  useGetAllItemsQuery,
  useGetAllMarkupsQuery,
  useGetAllTaxesQuery,
} from "@/redux/api/admin/estimateApi";
import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { GoPlus } from "react-icons/go";
import { CustomModal } from "../modal/CustomModal";
import { DepositModalContent, DiscountModalContent } from "../modal/PopUp";

export default function CommonEstimateTable({
  onDataChange,
}: {
  onDataChange?: (data: any) => void;
}) {
  const [items, setItems] = useState<{ id: number }[]>([]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
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
  const [summaryDiscount, setSummaryDiscount] = useState<{
    value: number;
    unit: "percent" | "dollar";
  } | null>(null);
  const [summaryDeposit, setSummaryDeposit] = useState<{
    value: number;
    unit: "percent" | "dollar";
  } | null>(null);

  const [markupSummaryModal, setMarkupSummaryModal] = useState(false);
  const [discountModal, setDiscountModal] = useState(false);
  const [depositModal, setDepositModal] = useState(false);

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
        quantity: isDeselecting ? "0" : "1",
      },
    }));
  };

  const addLine = () => {
    setItems([...items, { id: Date.now() }]);
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
      // Optionally refetch markups
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
    setSelectedTaxesByRow((prev) => ({
      ...prev,
      [activeTaxRowId]: tax,
    }));
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
      // Optionally refetch taxes
    } catch (error) {
      console.error("Failed to create tax:", error);
    }
  };

  const handleSelectSummaryMarkup = (markup: any) => {
    setSummaryMarkup(markup);
    setMarkupSummaryModal(false);
  };

  // Provide data to parent
  useEffect(() => {
    if (onDataChange) {
      const itemsData = items.map((item) => {
        const rate = parseFloat(rowData[item.id]?.rate || "0") || 0;
        const quantity = parseFloat(rowData[item.id]?.quantity || "0") || 0;
        const markupPercent = selectedMarkupsByRow[item.id]?.percentage || 0;
        const taxPercent = selectedTaxesByRow[item.id]?.percentage || 0;
        const base = rate * quantity;
        const markupAmount = base * (markupPercent / 100);
        const subtotal = base + markupAmount;
        const taxAmount = subtotal * (taxPercent / 100);
        const total = subtotal + taxAmount;
        const roundedTotal = Math.round(total);

        return {
          selectedItem: selectedItemsByTable[item.id],
          quantity,
          total: roundedTotal,
        };
      });

      const subtotal = itemsData.reduce((sum, item) => sum + item.total, 0);
      let grandTotal = subtotal;
      if (summaryMarkup) {
        grandTotal += subtotal * (summaryMarkup.percentage / 100);
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
          grandTotal += subtotal * (summaryDeposit.value / 100);
        } else {
          grandTotal += summaryDeposit.value;
        }
      }

      onDataChange({
        items: itemsData,
        summaryMarkup,
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
    summaryDiscount,
    summaryDeposit,
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
              const markupPercent =
                selectedMarkupsByRow[item.id]?.percentage || 0;
              const taxPercent = selectedTaxesByRow[item.id]?.percentage || 0;

              const base = rate * quantity;
              const markupAmount = base * (markupPercent / 100);
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
                    {/* Row */}
                    <div className="grid grid-cols-1 md:grid-cols-6 border">
                      {/* Description with item list */}
                      <div className="col-span-1 md:col-span-1 border-r md:border-r p-2 text-sm text-gray-500">
                        <label className="block md:hidden font-medium mb-1">
                          Description
                        </label>
                        <div className="flex items-center justify-between  border-b md:border-b-0 p-2 md:p-0">
                          <span className="hidden md:inline">Description</span>
                          <span
                            onClick={() => openItemModal(item.id)}
                            className="text-orange-500 text-base cursor-pointer mt-3 md:mt-0"
                          >
                            Item List
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-1 p-2 border-r   md:border-r border-b md:border-b-0  md:p-0">
                        <label className="block md:hidden text-basefont-medium mb-1">
                          Rate
                        </label>
                        <input
                          className="cell w-full focus:outline-none focus:ring-1 focus:ring-primary 
             focus:border-primary transition p-2"
                          placeholder="$0.00"
                          value={rowData[item.id]?.rate || ""}
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
                      <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0  md:p-0">
                        <label className="block md:hidden text-sm font-medium mb-1">
                          Markup
                        </label>
                        <input
                          className="cell cursor-pointer bg-white/90 w-full"
                          placeholder="Markup"
                          value={
                            selectedMarkupsByRow[item.id]
                              ? `${selectedMarkupsByRow[item.id].percentage}% `
                              : ""
                          }
                          readOnly
                          onClick={() => openMarkupPicker(item.id)}
                        />
                      </div>
                      <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0  md:p-0">
                        <label className="block md:hidden text-sm font-medium mb-1">
                          Quantity
                        </label>
                        <input
                          className="cell w-full focus:outline-none focus:ring-1 focus:ring-primary 
             focus:border-primary transition p-2"
                          placeholder="0"
                          value={rowData[item.id]?.quantity ?? "0"}
                          onChange={(e) =>
                            setRowData((prev) => ({
                              ...prev,
                              [item.id]: {
                                ...prev[item.id],
                                quantity: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                      <div className="md:col-span-1 p-2 border-r md:border-r border-b md:border-b-0  md:p-0">
                        <label className="block md:hidden text-sm font-medium mb-1">
                          Tax
                        </label>
                        <input
                          className="cell w-full"
                          placeholder="Tax"
                          value={
                            selectedTaxesByRow[item.id]
                              ? `${selectedTaxesByRow[item.id].percentage}%`
                              : ""
                          }
                          readOnly
                          onClick={() => openTaxPicker(item.id)}
                        />
                      </div>
                      <div className="md:col-span-1 p-2">
                        <label className="block md:hidden text-sm font-medium mb-1">
                          Total
                        </label>
                        <input
                          className="cell w-full"
                          placeholder="$0.00"
                          value={`$${total.toFixed(2)}`}
                          readOnly
                        />
                      </div>
                    </div>

                    {/* Notes inside same box */}
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
                        </div>
                      ) : (
                        <textarea
                          placeholder="Notes"
                          className="w-full p-2 text-sm outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        <button
          onClick={addLine}
          className="mt-4 w-full border border-orange-400 text-orange-500 rounded-lg py-2 flex items-center justify-center md:justify-start p-4 gap-2"
        >
          <Plus size={16} /> Add Line Item
        </button>
      </div>

      {/* Summary */}
      {items.length > 0 && (
        <div className="flex justify-end mt-6">
          <div className="w-72 space-y-2 text-base">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>
                $
                {(() => {
                  let sum = 0;
                  items.forEach((item) => {
                    const rate = parseFloat(rowData[item.id]?.rate || "0") || 0;
                    const quantity =
                      parseFloat(rowData[item.id]?.quantity || "0") || 0;
                    const markupPercent =
                      selectedMarkupsByRow[item.id]?.percentage || 0;
                    const taxPercent =
                      selectedTaxesByRow[item.id]?.percentage || 0;
                    const base = rate * quantity;
                    const markupAmount = base * (markupPercent / 100);
                    const subtotal = base + markupAmount;
                    const taxAmount = subtotal * (taxPercent / 100);
                    const total = subtotal + taxAmount;
                    sum += total;
                  });
                  return sum.toFixed(2);
                })()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Markup</span>
              <span
                className="text-orange-500 cursor-pointer"
                onClick={() => setMarkupSummaryModal(true)}
              >
                {summaryMarkup ? `${summaryMarkup.percentage}% ` : "Add"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Discount</span>
              <span
                className="text-orange-500 cursor-pointer"
                onClick={() => setDiscountModal(true)}
              >
                {summaryDiscount
                  ? `${summaryDiscount.value}${summaryDiscount.unit === "percent" ? "%" : "$"}`
                  : "Add"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Request a deposit</span>
              <span
                className="text-orange-500 cursor-pointer"
                onClick={() => setDepositModal(true)}
              >
                {summaryDeposit
                  ? `${summaryDeposit.value}${summaryDeposit.unit === "percent" ? "%" : "$"}`
                  : "Add"}
              </span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Total (USD)</span>
              <span className="text-orange-500">
                $
                {(() => {
                  let subtotal = 0;
                  items.forEach((item) => {
                    const rate = parseFloat(rowData[item.id]?.rate || "0") || 0;
                    const quantity =
                      parseFloat(rowData[item.id]?.quantity || "0") || 0;
                    const markupPercent =
                      selectedMarkupsByRow[item.id]?.percentage || 0;
                    const taxPercent =
                      selectedTaxesByRow[item.id]?.percentage || 0;
                    const base = rate * quantity;
                    const markupAmount = base * (markupPercent / 100);
                    const itemSubtotal = base + markupAmount;
                    const taxAmount = itemSubtotal * (taxPercent / 100);
                    const total = itemSubtotal + taxAmount;
                    subtotal += total;
                  });

                  // Apply summary markup
                  let total = subtotal;
                  if (summaryMarkup) {
                    total += subtotal * (summaryMarkup.percentage / 100);
                  }

                  // Apply discount
                  if (summaryDiscount) {
                    if (summaryDiscount.unit === "percent") {
                      total -= total * (summaryDiscount.value / 100);
                    } else {
                      total -= summaryDiscount.value;
                    }
                  }

                  // Apply deposit
                  if (summaryDeposit) {
                    if (summaryDeposit.unit === "percent") {
                      total += subtotal * (summaryDeposit.value / 100);
                    } else {
                      total += summaryDeposit.value;
                    }
                  }

                  return total.toFixed(2);
                })()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* markup */}
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
          {allItems.length === 0 ? (
            <p className="text-sm text-gray-500">No items available.</p>
          ) : (
            allItems.map((item: any) => {
              const isSelected =
                activeTableId !== null &&
                selectedItemsByTable[activeTableId]?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleItem(item)}
                  className={`flex justify-between items-start border p-3 rounded-xl cursor-pointer transition ${
                    isSelected
                      ? "bg-orange-50 border-orange-400"
                      : "border-gray-200"
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
            })
          )}
        </div>
      </CustomModal>

      <CustomModal
        open={markupModalOpen}
        onClose={() => setMarkupModalOpen(false)}
        title=" Markup"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => setMarkupModalOpen(false),
          },
        ]}
      >
        <div className="space-y-3">
          {markups.length === 0 ? (
            <p className="text-sm text-gray-500">No markups available.</p>
          ) : (
            markups.map((markup: any) => (
              <div
                key={markup.id}
                onClick={() => handleSelectMarkup(markup)}
                className="p-3 border rounded-xl cursor-pointer hover:bg-orange-50"
              >
                <p className="font-semibold">{markup.name}</p>
                <p className="text-sm text-gray-500">{markup.percentage}%</p>
              </div>
            ))
          )}
        </div>

        <button
          className="flex items-center gap-2  mt-3  py-4"
          onClick={() => setOpenCreateMarkupModal(true)}
        >
          <GoPlus
            size={30}
            className="text-lg bg-primary p-1 text-white rounded-full"
          />
          <span className="font-medium">Add Markup</span>
        </button>
      </CustomModal>

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

      {/* tax */}
      {addTax && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl p-5 space-y-3">
            {/* TITLE */}
            <h2 className="text-lg font-semibold">Select Tax</h2>

            {/* TAX LIST */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {taxes?.length > 0 ? (
                taxes.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => handleSelectTax(t)}
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

      {/* Summary Markup Modal */}
      <CustomModal
        open={markupSummaryModal}
        onClose={() => setMarkupSummaryModal(false)}
        title="Select Markup"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => setMarkupSummaryModal(false),
          },
        ]}
      >
        <div className="space-y-3">
          {markups.length === 0 ? (
            <p className="text-sm text-gray-500">No markups available.</p>
          ) : (
            markups.map((markup: any) => (
              <div
                key={markup.id}
                onClick={() => handleSelectSummaryMarkup(markup)}
                className="p-3 border rounded-xl cursor-pointer hover:bg-orange-50"
              >
                <p className="font-semibold">{markup.name}</p>
                <p className="text-sm text-gray-500">{markup.percentage}%</p>
              </div>
            ))
          )}
        </div>
      </CustomModal>

      {/* Discount Modal */}
      <CustomModal
        open={discountModal}
        onClose={() => setDiscountModal(false)}
        title="Discount"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => setDiscountModal(false),
          },
          {
            label: "Apply",
            variant: "primary",
            onClick: () => setDiscountModal(false),
          },
        ]}
      >
        <DiscountModalContent
          value={summaryDiscount?.value || 0}
          setValue={(val: number) =>
            setSummaryDiscount((prev) =>
              prev ? { ...prev, value: val } : { value: val, unit: "percent" },
            )
          }
        />
      </CustomModal>

      {/* Deposit Modal */}
      <CustomModal
        open={depositModal}
        onClose={() => setDepositModal(false)}
        title="Deposit"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => setDepositModal(false),
          },
          {
            label: "Apply",
            variant: "primary",
            onClick: () => setDepositModal(false),
          },
        ]}
      >
        <DepositModalContent
          value={summaryDeposit?.value || 0}
          setValue={(val: number) =>
            setSummaryDeposit((prev) =>
              prev ? { ...prev, value: val } : { value: val, unit: "percent" },
            )
          }
        />
      </CustomModal>
    </div>
  );
}
