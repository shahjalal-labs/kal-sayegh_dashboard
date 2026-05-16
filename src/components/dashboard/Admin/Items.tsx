"use client";

import { CustomModal } from "@/components/modal/CustomModal";
import {
  useCreateItemMutation,
  useCreateMarkupMutation,
  useCreateTaxMutation,
  useGetAllItemsQuery,
  useGetAllMarkupsQuery,
  useGetAllTaxesQuery,
} from "@/redux/api/admin/estimateApi";
import { Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { GoPlus } from "react-icons/go";
import { ColorRing } from "react-loader-spinner";
import { toast } from "sonner";

export default function Items() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [formatModalOpen, setFormatModalOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedMarkupIds, setSelectedMarkupIds] = useState<string[]>([]);

  const formatOptions = [
    { id: "DESCRIPTION", label: "Description" },
    { id: "TABLE", label: "Table Format" },
    { id: "IMAGE_PDF", label: "Image PDF Format" },
  ];
  const [addItem] = useCreateItemMutation();

  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);
  const [itemImages, setItemImages] = useState<File[]>([]);

  const { data, isLoading } = useGetAllItemsQuery({});
  const items = data?.result ?? [];

  const { data: allTax } = useGetAllTaxesQuery({});

  const taxes = allTax?.result;

  const { data: allMarkup, refetch: refetchMarkups } = useGetAllMarkupsQuery();
  const markups = allMarkup?.result ?? [];

  const [createTax] = useCreateTaxMutation();

  const [createMarkup] = useCreateMarkupMutation();

  const [taxOpen, setTaxOpen] = useState(false);

  const [taxForm, setTaxForm] = useState({
    name: "",
    percentage: "",
  });

  const [markupOpen, setMarkupOpen] = useState(false);

  const [markupForm, setMarkupForm] = useState({
    name: "",
    amount: "",
  });

  const [form, setForm] = useState({
    itemName: "",
    rate: "",
    description: "",
    notes: "",
    format: "",
  });

  const isImagePdfFormat = form.format === "IMAGE_PDF";

  const toggleMarkup = (id: string) => {
    setSelectedMarkupIds((prev) =>
      prev.includes(id)
        ? prev.filter((markupId) => markupId !== id)
        : [...prev, id],
    );
  };

  const toggleTax = (id: string) => {
    setSelectedTaxes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  const handleChange = (e: any) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTax = async () => {
    try {
      const payload = {
        name: taxForm.name,
        percentage: Number(taxForm.percentage),
      };

      const res = await createTax(payload).unwrap();

      setTaxOpen(false);
      setTaxForm({
        name: "",
        percentage: "",
      });
      toast.success("Tax Created Successfully");
    } catch (error) {
      toast.error("Tax Create Failed");
    }
  };

  const handleCreateMarkup = async () => {
    try {
      const payload = {
        name: markupForm.name,
        amount: Number(markupForm.amount),
      };

      await createMarkup(payload).unwrap();
      await refetchMarkups();

      setMarkupOpen(false);
      setMarkupForm({
        name: "",
        amount: "",
      });
      toast.success("Markup Created Successfully");
    } catch (error) {
      toast.error("Markup Create Failed");
    }
  };

  const handleAddItem = async () => {
    try {
      const formData = new FormData();
      const finalPayload: any = {
        itemName: form.itemName,
        rate: Number(form.rate),
        description: form.description,
        notes: form.notes,
        taxes: selectedTaxes,
        format: form.format,
      };

      if (selectedMarkupIds.length > 0) {
        finalPayload.markUpIds = selectedMarkupIds;
        finalPayload.markUpId = selectedMarkupIds[0];
      }

      formData.append("bodyData", JSON.stringify(finalPayload));

      itemImages.forEach((file) => {
        formData.append("itemImages", file);
      });

      await addItem(formData).unwrap();

      toast.success("Item Created Successfully");
      setOpen(false);

      setForm({
        itemName: "",
        rate: "",
        description: "",
        notes: "",
        format: "",
      });

      // reset taxes, markups, and images
      setSelectedTaxes([]);
      setSelectedMarkupIds([]);
      setItemImages([]);
    } catch (error) {
      toast.error("Item Created Failed!");
      console.log(error);
    }
  };

  const filteredItems = items.filter((item: any) =>
    item.itemName.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading)
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

  return (
    <div className="p-4  bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-xl md:text-3xl font-semibold px-9">Item List</h1>

        <div className="flex gap-3 w-full md:w-auto">
          {/* SEARCH */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="border rounded-xl px-4 py-2 w-full md:w-[300px] focus:outline-none focus:ring-1 focus:ring-primary"
          />

          {/* ADD BUTTON */}
          <button
            onClick={() => setFormatModalOpen(true)}
            className="bg-primary hover:bg-primary/80 text-white px-5 py-2 rounded-xl transition-colors text-base md:text-lg"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* ITEM LIST */}
      <div className="bg-white rounded-xl  divide-y p-5">
        {filteredItems.length > 0 ? (
          filteredItems.map((item: any) => (
            <div
              key={item.id}
              className="p-4 flex justify-between items-start hover:bg-orange-50 transition"
            >
              <div className="space-y-1">
                <h2 className="font-semibold text-gray-800 uppercase text-2xl">
                  {item.itemName}
                </h2>

                <p className="text-base text-gray-500">{item.description}</p>

                {item.markUp && (
                  <p className="text-base text-gray-400">
                    Markup: {item.markUp.name}
                  </p>
                )}

                {item.taxes?.length > 0 && (
                  <p className="text-base text-gray-400">
                    Taxes: {item.taxes.map((t: any) => t.name).join(", ")}
                  </p>
                )}

                {item.format && (
                  <p className="text-base text-gray-400">
                    Format: {item.format}
                  </p>
                )}
              </div>

              <div className="text-right min-w-[120px]">
                <p className="text-lg font-semibold text-gray-800">
                  ${item?.rate || 0}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-2xl">No items found</p>
        )}
      </div>

      {/* FORMAT MODAL */}
      <CustomModal
        open={formatModalOpen}
        onClose={() => setFormatModalOpen(false)}
        title="Select Format"
        actions={[
          {
            label: "Close",
            variant: "secondary",
            onClick: () => setFormatModalOpen(false),
          },
          {
            label: "Add Line",
            variant: "primary",
            onClick: () => {
              if (!selectedFormat) {
                toast.error("Please select a format");
                return;
              }

              setForm((prev) => ({
                ...prev,
                format: selectedFormat,
              }));

              if (selectedFormat !== "IMAGE_PDF") {
                setItemImages([]);
              }

              setFormatModalOpen(false);
              setOpen(true);
            },
          },
        ]}
      >
        <div className="space-y-3">
          {formatOptions.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedFormat(item.id)}
              className={`flex items-center justify-between border rounded-xl p-4 cursor-pointer transition ${
                selectedFormat === item.id
                  ? "border-primary bg-orange-50"
                  : "border-gray-200"
              }`}
            >
              <p className="font-medium">{item.label}</p>

              <div className="w-5 h-5 flex items-center justify-center">
                {selectedFormat === item.id && (
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

      {/* MODAL */}
      <CustomModal
        open={open}
        onClose={() => setOpen(false)}
        title="Add Item"
        actions={[
          {
            label: "Cancel",
            onClick: () => setOpen(false),
            variant: "secondary",
          },
          {
            label: "Create",
            onClick: handleAddItem,
            variant: "primary",
          },
        ]}
      >
        {/* BODY */}
        <div className="space-y-6">
          <div>
            <label>Item Name</label>
            <input
              name="itemName"
              placeholder="Enter item name"
              className="border p-2 w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              value={form.itemName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Rate</label>
            <input
              name="rate"
              type="number"
              placeholder="Rate"
              className="border p-2 w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              value={form.rate}
              onChange={handleChange}
              required
            />
          </div>

          {form.format !== "IMAGE_PDF" && (
            <div>
              <label>Description</label>
              <textarea
                rows={5}
                name="description"
                placeholder="Enter Description"
                className="border p-2 w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.description}
                onChange={handleChange}
              />
            </div>
          )}
          <div>
            <label>Private Notes</label>
            <textarea
              name="notes"
              rows={5}
              placeholder="Enter Private Notes"
              className="border p-2 w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          {isImagePdfFormat && (
            <div>
              <label>Item Images</label>
              <div className="border-2 border-dashed rounded-xl py-7 p-4 text-center cursor-pointer hover:bg-orange-50 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setItemImages((prev) => [...prev, ...files]);
                    e.target.value = "";
                  }}
                  className="hidden"
                  id="itemImageInput"
                />
                <label
                  htmlFor="itemImageInput"
                  className="cursor-pointer block"
                >
                  <p className="font-medium text-gray-700">
                    Click to upload or drag images
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </label>
              </div>

              {itemImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-3">
                    Selected Images: {itemImages.length}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {itemImages.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx}`}
                          width={200}
                          height={200}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setItemImages((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold mb-3">Taxes</h2>
            {taxes?.map((tax: any) => {
              const isSelected = selectedTaxes.includes(tax.id);

              return (
                <div
                  key={tax.id}
                  className="flex justify-between items-center  p-3 rounded mb-2"
                >
                  {/* LEFT SIDE */}
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{tax.name}</p>
                    <p className="text-sm text-gray-500">{tax.percentage}%</p>
                  </div>

                  {/* RIGHT SIDE TOGGLE SWITCH */}
                  <button
                    type="button"
                    onClick={() => toggleTax(tax.id)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                      isSelected ? "bg-orange-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                        isSelected ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              );
            })}
            <div
              onClick={() => setTaxOpen(true)}
              className="flex items-center gap-2 border-b py-4"
            >
              <GoPlus
                size={30}
                className="bg-[#DC4D32] text-white p-1 rounded-full"
              />
              <span className="text-[#DC4D32]"> Add New Tax</span>
            </div>

            <div className="flex justify-between border-b my-4 pb-5">
              <p className="text-2xl">Markup</p>{" "}
              <button
                onClick={() => setMarkupOpen(true)}
                className="text-primary text-2xl"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold mb-3"> All Markup</h2>
              {selectedMarkupIds.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected {selectedMarkupIds.length} markup&apos;s
                </p>
              )}
            </div>

            <div className="space-y-2 ">
              {markups.length > 0 ? (
                markups.map((markup: any) => {
                  const isSelected = selectedMarkupIds.includes(markup.id);

                  return (
                    <div
                      key={markup.id}
                      className="flex justify-between items-center p-3 rounded mb-2"
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 ">
                          {markup.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {markup.percentage != null
                            ? `${markup.percentage}%`
                            : `$ ${Number(markup.amount || 0).toFixed(2)}`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleMarkup(markup.id)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                          isSelected ? "bg-orange-500" : "bg-gray-300"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition ${
                            isSelected ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500">No markups found.</p>
              )}
            </div>
          </div>
        </div>
      </CustomModal>

      <CustomModal
        open={taxOpen}
        onClose={() => setTaxOpen(false)}
        title=" New Tax"
        maxWidth="md"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => setTaxOpen(false),
          },
          {
            label: "Add",
            variant: "primary",
            onClick: handleCreateTax,
          },
        ]}
      >
        <div className="space-y-4">
          <input
            name="name"
            placeholder="Tax Name"
            className="border p-2 w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
            value={taxForm.name}
            onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })}
          />

          <input
            name="percentage"
            type="number"
            placeholder="Tax Rate (%)"
            className="border p-2 w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
            value={taxForm.percentage}
            onChange={(e) =>
              setTaxForm({ ...taxForm, percentage: e.target.value })
            }
          />
        </div>
      </CustomModal>

      <CustomModal
        open={markupOpen}
        onClose={() => setMarkupOpen(false)}
        title="New Markup"
        maxWidth="md"
        actions={[
          {
            label: "Cancel",
            variant: "secondary",
            onClick: () => setMarkupOpen(false),
          },
          {
            label: "Add",
            variant: "primary",
            onClick: handleCreateMarkup,
          },
        ]}
      >
        <div className="space-y-5 ">
          <input
            name="name"
            placeholder="Markup Name"
            className="border p-2 w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
            value={markupForm.name}
            onChange={(e) =>
              setMarkupForm({ ...markupForm, name: e.target.value })
            }
          />

          <input
            name="amount"
            type="number"
            placeholder="Markup Amount"
            className="border p-2 w-full rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
            value={markupForm.amount}
            onChange={(e) =>
              setMarkupForm({ ...markupForm, amount: e.target.value })
            }
          />
        </div>
      </CustomModal>
    </div>
  );
}
