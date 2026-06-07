"use client";

import { CustomModal } from "@/components/modal/CustomModal";
import { useGetAllItemsQuery } from "@/redux/api/admin/estimateApi";
import { FormatType } from "@/types/estimate.type";
import { Camera, Check, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import { useGenerateUrlMutation } from "@/redux/api/admin/messageApi";
import { toast } from "sonner";

type FormatOption = "description" | "table" | "upload";

interface CommonTableProps {
  onDataChange?: (data: any) => void;
  initialItems?: any[];
}

const OPTIONS: Array<{ id: FormatOption; label: string }> = [
  { id: "description", label: "Description" },
  { id: "table", label: "Table Format" },
  { id: "upload", label: "Upload Picture ,PDF , Document" },
];

const formatMap: Record<FormatOption, FormatType> = {
  description: "DESCRIPTION",
  table: "TABLE",
  upload: "IMAGE_PDF",
};

type SubItemRow = {
  title: string;
  quantity: number;
  unitCost: number;
  price: number;
};

const money = (value: number) => `$${Number(value || 0).toFixed(2)}`;

export default function CommonTable({ onDataChange, initialItems }: CommonTableProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [itemListOpen, setItemListOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<FormatOption>("table");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const [generateUrlFn, { isLoading: isUploading }] = useGenerateUrlMutation();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [committedItems, setCommittedItems] = useState<any[]>(() => {
    if (!initialItems || !initialItems.length) return [];
    return initialItems.map(it => ({
      item: it.selectedItem,
      quantity: it.quantity,
      description: it.selectedItem?.description || "",
      subItems: [],
      baseRate: it.rate || 0,
      markupValue: 0,
      taxValue: 0,
      lineTotal: it.total || 0,
    }));
  });

  const [quantity, setQuantity] = useState("1");
  const [description, setDescription] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [subItemTitle, setSubItemTitle] = useState("");
  const [subItemQty, setSubItemQty] = useState("1");
  const [subItemUnitCost, setSubItemUnitCost] = useState("");
  const [subItems, setSubItems] = useState<SubItemRow[]>([]);

  const { data } = useGetAllItemsQuery({});
  const items = data?.result || [];
  const activeFormat = formatMap[selectedFormat];

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item: any) => (item?.format || "DESCRIPTION") === activeFormat,
      ),
    [activeFormat, items],
  );

  const baseRate = useMemo(() => {
    if (subItems.length > 0) {
      return subItems.reduce((sum, item) => sum + item.price, 0);
    }
    return Number(selectedItem?.rate || 0);
  }, [selectedItem, subItems]);

  const markupValue = useMemo(() => {
    const markup = selectedItem?.markUp;
    if (!markup) return 0;

    if (markup.percentage != null) {
      return (baseRate * Number(markup.percentage || 0)) / 100;
    }

    return Number(markup.amount || 0);
  }, [baseRate, selectedItem?.markUp]);

  const taxValue = useMemo(() => {
    const taxableBase = baseRate + markupValue;
    return (selectedItem?.taxes || []).reduce((sum: number, tax: any) => {
      return sum + (taxableBase * Number(tax?.percentage || 0)) / 100;
    }, 0);
  }, [baseRate, markupValue, selectedItem?.taxes]);

  const lineTotal = useMemo(() => {
    return (baseRate + markupValue + taxValue) * Number(quantity || 0);
  }, [baseRate, markupValue, quantity, taxValue]);

  const emitData = () => {
    if (!onDataChange) return;

    const itemsToEmit = committedItems.map(c => ({
      id: c.item.id,
      description: c.description || c.item.description || "",
      itemName: c.item.itemName,
      markUp: c.markupValue,
      quantity: Number(c.quantity || 0),
      tax: c.taxValue,
      total: c.lineTotal,
      originalItem: c.item,
      percentage: Number(c.item?.markUp?.percentage || 0),
      amount: Number(c.item?.markUp?.amount || 0),
      rate: Number(c.baseRate || 0),
      format: c.item?.format || activeFormat,
      selectedItem: c.item,
    }));

    if (selectedItem) {
      itemsToEmit.push({
        id: selectedItem.id,
        description: description || selectedItem.description || "",
        itemName: selectedItem.itemName,
        markUp: markupValue,
        quantity: Number(quantity || 0),
        tax: taxValue,
        total: lineTotal,
        originalItem: selectedItem,
        percentage: Number(selectedItem?.markUp?.percentage || 0),
        amount: Number(selectedItem?.markUp?.amount || 0),
        rate: Number(baseRate || 0),
        format: selectedItem?.format || activeFormat,
        selectedItem: selectedItem,
      });
    }

    const allSubItems = [
      ...committedItems.flatMap(c => c.subItems.map((s: any) => ({
        title: s.title,
        quantity: s.quantity,
        unitCost: s.unitCost,
        price: s.price,
      }))),
      ...subItems.map((s: any) => ({
        title: s.title,
        quantity: s.quantity,
        unitCost: s.unitCost,
        price: s.price,
      }))
    ];

    const grandTotal = committedItems.reduce((sum, c) => sum + c.lineTotal, 0) + (selectedItem ? lineTotal : 0);

    onDataChange({
      items: itemsToEmit,
      subItems: allSubItems,
      grandTotal: grandTotal,
      summaryMarkup: null,
      summaryDiscount: null,
      summaryDeposit: null,
    });
  };

  useEffect(() => {
    emitData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committedItems, selectedItem, quantity, description, privateNote, subItems]);

  const openFormatPicker = () => setPickerOpen(true);

  const openItemList = () => {
    setPickerOpen(false);
    setItemListOpen(true);
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setUploadedImage(null);
    setQuantity("1");
    setDescription(item?.description || "");
    setPrivateNote(item?.notes || "");
    setSubItemTitle("");
    setSubItemQty("1");
    setSubItemUnitCost("");
    setSubItems([]);
    setItemListOpen(false);
    setDetailOpen(true);
  };

  const handleCommitItem = () => {
    if (!selectedItem) return;

    if (subItemTitle.trim() !== "" || (subItemUnitCost && Number(subItemUnitCost) > 0)) {
      toast.error("Please click the '+' button to add your sub-item, or clear the inputs before adding to estimate.");
      return;
    }

    const finalItem = {
      ...selectedItem,
      imageUrls: uploadedImage ? [uploadedImage, ...(selectedItem.imageUrls || []).slice(1)] : selectedItem.imageUrls,
    };

    setCommittedItems(prev => [
      ...prev,
      {
        item: finalItem,
        quantity,
        description,
        subItems: [...subItems],
        baseRate,
        markupValue,
        taxValue,
        lineTotal
      }
    ]);

    setSelectedItem(null);
    setUploadedImage(null);
    setQuantity("1");
    setDescription("");
    setPrivateNote("");
    setSubItems([]);
    setDetailOpen(false);
  };

  const handleAddSubItem = () => {
    const title = subItemTitle.trim();
    const qty = Number(subItemQty || 0);
    const unitCost = Number(subItemUnitCost || 0);

    if (!title || qty <= 0 || unitCost <= 0) return;

    setSubItems((prev) => [
      ...prev,
      {
        title,
        quantity: qty,
        unitCost,
        price: qty * unitCost,
      },
    ]);

    setSubItemTitle("");
    setSubItemQty("1");
    setSubItemUnitCost("");
  };

  const handleRemoveSubItem = (index: number) => {
    setSubItems((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("urls", file);
      const response = await generateUrlFn(formData).unwrap();

      if (response?.success && Array.isArray(response?.result)) {
        const url = response.result[0]?.url;
        if (url) {
          setUploadedImage(url);

        }
      } else {
        toast.error(response?.message || "Image upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Image upload failed");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const itemImages = selectedItem?.imageUrls || [];

  return (
    <div>

      {(committedItems.length > 0 || selectedItem) && (
        <div className="flex items-center justify-between border-b-2 px-4 py-3 bg-[#f7f7f7]">
          <span className="text-lg font-bold uppercase tracking-wide text-gray-900">
            Description
          </span>
          <span className="text-lg font-semibold text-gray-900">
            Organize
          </span>
        </div>
      )}

      {committedItems.map((cItem, index) => {
        const cBaseRate = cItem.baseRate;
        const cMarkupValue = cItem.markupValue;
        const cLineTotal = cItem.lineTotal;

        return (
          <div key={`${cItem.item.id}-${index}`} className="mt-6 overflow-hidden bg-white">
            <div className="p-4 pt-0">
              <table className="w-full border-collapse text-lg">
                <thead>
                  <tr className="border-2 border-black/50 bg-white uppercase text-base font-semibold text-gray-900">
                    <th className="w-[52%] border-r-2 border-black/50 px-2 py-3 text-left">
                      Scope of Work
                    </th>
                    <th className="w-[12%] border-r-2 border-black/50 px-2 py-3 text-center">
                      Qty
                    </th>
                    <th className="w-[18%] border-r-2 border-black/50 px-2 py-3 text-center">
                      Unit Cost
                    </th>
                    <th className="w-[18%] px-2 py-3 text-center">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-x-2 border-b-2 border-black/50 bg-gray-100">
                    <td className="border-r-2 border-black/50 px-2 py-1 text-base font-semibold text-gray-800">
                      {cItem.item.itemName}
                    </td>
                    <td className="border-r-2 border-black/50 px-2 py-1 text-center font-semibold text-gray-800">
                    </td>
                    <td className="border-r-2 border-black/50 px-2 py-1 text-center font-semibold text-gray-800">
                    </td>
                    <td className="px-2 py-1 text-center font-semibold text-gray-800">
                    </td>
                  </tr>
                  {cItem.subItems.map((subItem: any, subIndex: number) => (
                    <tr
                      key={`${subItem.title}-${subIndex}`}
                      className="border-x-2 border-b-2 border-black/50 bg-white align-top"
                    >
                      <td className="border-r-2 border-black/50 px-2 py-1 pl-6 text-gray-800">
                        {subItem.title}
                      </td>
                      <td className="border-r-2 border-black/50 px-2 py-1 text-center text-gray-800">
                        {subItem.quantity}
                      </td>
                      <td className="border-r-2 border-black/50 px-2 py-1 text-center text-gray-800">
                        {money(subItem.unitCost)}
                      </td>
                      <td className="px-2 py-1 text-center font-semibold text-gray-800">
                        {money(subItem.price)}
                      </td>
                    </tr>
                  ))}

                  <tr className="border-x-2 border-b-2 border-black/50 bg-white">
                    <td colSpan={2} />
                    <td className="px-2 py-1 text-right font-semibold text-gray-900">
                      Sub Total:
                    </td>
                    <td className="px-2 py-1 text-center font-semibold text-gray-900">
                      {money(cLineTotal)}
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {committedItems.length > 0 && (
        <div className="w-full text-right pr-6 pt-6 pb-6 font-semibold text-gray-900 text-xl">
          Grand Total: {money(committedItems.reduce((sum, item) => sum + item.lineTotal, 0))}
        </div>
      )}



      <div className="flex w-full mt-6">
        <button
          type="button"
          className="text-primary border-primary border px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 w-full"
          onClick={openFormatPicker}
        >
          <Plus size={16} />
          Add Line Item
        </button>
      </div>


      <CustomModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Add Line item"
        maxWidth="md"
        actions={[
          {
            label: "Close",
            variant: "secondary",
            onClick: () => setPickerOpen(false),
          },
          {
            label: "Add Line",
            variant: "primary",
            onClick: openItemList,
          },
        ]}
      >
        <div className="space-y-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedFormat(opt.id)}
              className={`w-full text-left rounded-xl border p-4 flex items-center justify-between transition-colors ${selectedFormat === opt.id
                ? "border-orange-400 bg-orange-50"
                : "border-gray-200 bg-white"
                }`}
            >
              <span className="font-medium text-gray-800">{opt.label}</span>
              {selectedFormat === opt.id ? (
                <span className="bg-[#e27932] text-white rounded-full p-1">
                  <Check size={14} />
                </span>
              ) : (
                <span className="w-5 h-5 rounded-full border border-gray-300" />
              )}
            </button>
          ))}
        </div>
      </CustomModal>

      <CustomModal
        open={itemListOpen}
        onClose={() => setItemListOpen(false)}
        title="Item List"
        maxWidth="xl"
        actions={[
          {
            label: "Close",
            variant: "secondary",
            onClick: () => setItemListOpen(false),
          },
          {
            label: "Add",
            variant: "primary",
            onClick: () => setItemListOpen(false),
          },
        ]}
      >
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item: any) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectItem(item)}
                className="w-full flex items-start justify-between gap-4 border border-gray-200 rounded-xl p-4 text-left hover:bg-orange-50 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-semibold text-gray-800 truncate">
                    {item.itemName}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {item.description || "No description"}
                  </p>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    {item.format || "DESCRIPTION"}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
              No items found for {activeFormat} format.
            </div>
          )}
        </div>
      </CustomModal>

      <CustomModal
        open={detailOpen && !!selectedItem}
        onClose={() => setDetailOpen(false)}
        title="Add Line Item"
        maxWidth="3xl"
        actions={[
          {
            label: "Close",
            variant: "secondary",
            onClick: () => setDetailOpen(false),
          },
          {
            label: "Add to Estimate",
            variant: "primary",
            onClick: handleCommitItem,
          },
        ]}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={selectedItem.itemName}
                readOnly
                className="w-full rounded-xl border border-gray-200 px-5 py-4 text-lg text-gray-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Item Images
              </label>
              <div
                className="h-24 w-24 rounded-xl border border-slate-300 bg-slate-100 flex items-center justify-center text-[#e27932] cursor-pointer relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage || itemImages[0] ? (
                  <img
                    src={uploadedImage || itemImages[0]}
                    alt={selectedItem.itemName}
                    className={`h-full w-full rounded-xl object-cover transition-all ${isUploading ? 'opacity-40' : 'group-hover:opacity-80'}`}
                  />
                ) : (
                  <Camera size={28} className={`transition-all ${isUploading ? 'opacity-40' : 'group-hover:opacity-80'}`} />
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#e27932] border-t-transparent" />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                Sub-Line Breakdown Items
              </h3>
              <div className="rounded-xl border border-slate-300 bg-[#f0f2f5] p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Sub-item Title"
                  value={subItemTitle}
                  onChange={(e) => setSubItemTitle(e.target.value)}
                  className="w-full rounded-xl border border-orange-400 bg-white px-5 py-4 text-base focus:outline-none"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    placeholder="Qty"
                    value={subItemQty}
                    onChange={(e) => setSubItemQty(e.target.value)}
                    className="w-[38%] rounded-xl border border-gray-200 bg-white px-5 py-4 text-base focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Unit Cost ..."
                    value={subItemUnitCost}
                    onChange={(e) => setSubItemUnitCost(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-white px-5 py-4 text-base focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubItem}
                    className="h-12 w-16 rounded-full bg-[#e27932] text-white text-2xl leading-none flex items-center justify-center shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                {subItems.length > 0 ? (
                  subItems.map((subItem, index) => (
                    <div
                      key={`${subItem.title}-${index}`}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {subItem.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {subItem.quantity.toFixed(1)} × Cost:{" "}
                          {money(subItem.unitCost)}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-700">
                          {money(subItem.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubItem(index)}
                          className="text-red-500 hover:text-red-700"
                          aria-label="Delete sub-item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No subline breakdown items added yet.
                  </p>
                )}
              </div>
            </div>

            <div className="h-px bg-gray-200" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 text-base focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Base Rate ($)
                  {subItems.length > 0 && (
                    <span className="block text-sm font-medium text-gray-600">
                      (Calculated)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={money(baseRate)}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 px-5 py-4 text-base focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-[#f0f2f5] p-4 space-y-2 text-base">
              <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2">
                <span className="text-gray-600">
                  {subItems.length > 0 ? "Base Rate (Subtotal items):" : "Base Rate:"}
                </span>
                <span className="font-semibold text-gray-800">
                  {money(baseRate)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2">
                <span className="text-gray-600">
                  Adjusted Unit Rate (With Markup):
                </span>
                <span className="font-semibold text-gray-800">
                  {money(baseRate + markupValue)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-600">Item Taxes Total:</span>
                <span className="font-semibold text-[#e27932]">
                  +{money(taxValue)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-5 py-4 text-base focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Private Note
              </label>
              <textarea
                rows={4}
                value={privateNote}
                onChange={(e) => setPrivateNote(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-5 py-4 text-base focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <h4 className="text-2xl font-semibold text-gray-800">Markups</h4>
              <button
                type="button"
                className="rounded-full bg-orange-50 px-4 py-2 text-[#e27932] font-semibold"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedItem?.markUp ? (
                <span className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-800">
                  {selectedItem.markUp.name}
                  <span className="text-gray-500">
                    (
                    {selectedItem.markUp.percentage != null
                      ? `${selectedItem.markUp.percentage}%`
                      : money(selectedItem.markUp.amount || 0)}
                    )
                  </span>
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  No markup selected
                </span>
              )}
            </div>

            <div>
              <h4 className="text-2xl font-semibold text-gray-800 mb-3">
                Applied Line Taxes
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selectedItem?.taxes || []).length > 0 ? (
                  selectedItem.taxes.map((tax: any) => (
                    <span
                      key={tax.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-gray-800"
                    >
                      {tax.name} ({tax.percentage}%)
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    No line taxes applied
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-orange-200 bg-[#fff8f3] px-5 py-4 flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-800">
                Total Line Value (Inc. Tax):
              </span>
              <span className="text-2xl font-bold text-[#e27932]">
                {money(lineTotal)}
              </span>
            </div>
          </div>
        )}
      </CustomModal>



      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        className="hidden"
      />
    </div>
  );
}
