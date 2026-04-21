"use client";

import { CustomModal } from "@/components/modal/CustomModal";
import {
  DepositModalContent,
  DiscountModalContent,
  MarkupModalContent,
} from "@/components/modal/PopUp";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { FiUserPlus } from "react-icons/fi";

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
  price: number;
  notes: string;
}

export default function EstimateTable() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addClientModalOpen, setAddClientModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "markup" | "discount" | "deposit" | null
  >(null);

  const [tempValue, setTempValue] = useState(0);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: Date.now().toString(),
      description: "",
      qty: 0,
      unit: "",
      unitCost: 0,
      price: 0,
      notes: "",
    },
  ]);

  const [estimateData, setEstimateData] = useState({
    estimateNumber: "",
    date: "02-27-2026",
    expirationDate: "02-27-2026",
    poNumber: "",
    unit: "",
    unitCost: "",
    price: "",
    description: "",
    notes: "",
  });

  const [markup, setMarkup] = useState<number | null>(null);
  const [discount, setDiscount] = useState<number | null>(null);
  const [deposit, setDeposit] = useState<number | null>(null);

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        description: "",
        qty: 0,
        unit: "",
        unitCost: 0,
        price: 0,
        notes: "",
      },
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const handleLineItemChange = (
    id: string,
    field: keyof LineItem,
    value: any,
  ) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const subtotal = lineItems.reduce((sum, item) => {
    return sum + item.qty * item.unitCost;
  }, 0);

  const markupAmount = markup ? (subtotal * markup) / 100 : 0;
  const discountAmount = discount ? (subtotal * discount) / 100 : 0;
  const depositAmount = deposit ? (subtotal * deposit) / 100 : 0;
  const total = subtotal + markupAmount - discountAmount - depositAmount;

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

  return (
    <div>
      <div className="hidden md:flex flex-row justify-between items-center gap-3">
        <Link
          href={"/admin/estimate"}
          className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} />
          <h2 className="text-lg font-normal">Back to Estimate</h2>
        </Link>

        <div className="flex space-x-4">
          <Link href={"/admin/estimate"}>
            <button className="px-6 py-2 border-[1px] border-primary text-primary hover:bg-primary transition-colors duration-300 hover:text-white rounded-xl">
              Cancel
            </button>
          </Link>
          <button className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-normal rounded-xl transition-colors">
            Submit Estimate
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center py-2 md:hidden block">
        {/* Arrow button on the left */}
        <Link
          href={"/admin/estimate"}
          className="absolute left-0 flex items-center gap-2 text-gray-700 hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Centered title */}
        <h2 className="text-2xl font-medium">Estimates</h2>
      </div>
      <div className="bg-none md:bg-secondary rounded-lg overflow-hidden md:shadow-md md:mt-10">
        <div className=" md:px-8 py-6 flex flex-col md:flex-row md:justify-between">
          <div className="hidden md:block">
            <p className="text-gray-600 font-normal">United States</p>
            <p className="text-gray-600">example03@gmail.com</p>
          </div>

          <div className="md:p-6 space-y-6 md:w-[456px] mt-3">
            <div className="border-dashed border-primary border-2 p-6 h-[167px] flex justify-center items-center rounded-2xl">
              <button
                onClick={() => setAddClientModalOpen(true)}
                className="text-primary hover:text-orange-600 flex items-center justify-center gap-2 font-semibold transition-colors"
              >
                <FiUserPlus size={20} />
                Add Client
              </button>
            </div>
            <div className=" space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimate#
                </label>
                <input
                  type="text"
                  placeholder="Estimate"
                  value={estimateData.estimateNumber}
                  onChange={(e) =>
                    setEstimateData({
                      ...estimateData,
                      estimateNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={estimateData.date}
                    onChange={(e) =>
                      setEstimateData({
                        ...estimateData,
                        date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <Calendar
                    size={20}
                    className="absolute right-3 top-2.5 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Expiration Date
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={estimateData.expirationDate}
                    onChange={(e) =>
                      setEstimateData({
                        ...estimateData,
                        expirationDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <Calendar
                    size={20}
                    className="absolute right-3 top-2.5 text-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  PO Number
                </label>
                <input
                  type="text"
                  placeholder="PO Number"
                  value={estimateData.poNumber}
                  onChange={(e) =>
                    setEstimateData({
                      ...estimateData,
                      poNumber: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            <CustomModal
              open={addClientModalOpen}
              onClose={() => setAddClientModalOpen(false)}
              title="Add Client"
              maxWidth="2xl"
              actions={[
                {
                  label: "Cancel",
                  onClick: () => setAddClientModalOpen(false),
                  variant: "secondary",
                },
                {
                  label: "Add",
                  onClick: () => console.log("Add Client logic here"),
                  variant: "primary",
                },
              ]}
            >
              <div className="space-y-4">
                <p className="font-normal">Basic Information</p>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder=" Name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Phone Number"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="text"
                    placeholder="Email Address"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div className="pt-4 space-y-4">
                  <h3 className="text-gray-700">Billing Information</h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="Address"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>
            </CustomModal>
          </div>
        </div>

        <div className="md:p-6">
          {/* Table */}
          <div className="overflow-x-auto md:block hidden rounded-sm">
            <table className="w-full text-sm ">
              <thead>
                <tr className="text-gray-700">
                  <th className="text-left px-3 py-2 border-b border-gray-300">
                    SCOPE OF WORK
                  </th>
                  <th className="text-center px-3 py-2 border-b border-l border-gray-300 w-24">
                    QTY
                  </th>
                  <th className="text-center px-3 py-2 border-b border-l border-gray-300 w-24">
                    UNIT
                  </th>
                  <th className="text-center px-3 py-2 border-b border-l border-gray-300 w-28">
                    UNIT COST
                  </th>
                  <th className="text-center px-3 py-2 border-b border-l border-gray-300 w-28">
                    PRICE
                  </th>
                </tr>
              </thead>

              <tbody className="border-collapse border">
                {lineItems.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr>
                      <td className="border-b border-gray-300">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleLineItemChange(
                              item.id,
                              "description",
                              e.target.value,
                            )
                          }
                          placeholder="Description"
                          className="w-full px-2 py-1.5 outline-none bg-transparent text-sm"
                        />
                      </td>

                      <td className="border-b border-l border-gray-300 text-center">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            handleLineItemChange(
                              item.id,
                              "qty",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-1 py-1.5 text-center outline-none bg-transparent"
                        />
                      </td>

                      <td className="border-b border-l border-gray-300 text-center">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) =>
                            handleLineItemChange(
                              item.id,
                              "unit",
                              e.target.value,
                            )
                          }
                          className="w-full px-1 py-1.5 text-center outline-none bg-transparent"
                        />
                      </td>

                      <td className="text-center border-t border-l border-gray-300">
                        <input
                          type="number"
                          value={item.unitCost}
                          onChange={(e) =>
                            handleLineItemChange(
                              item.id,
                              "unitCost",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-1 py-1.5 text-center outline-none bg-transparent"
                        />
                      </td>

                      <td className="border-t border-l border-gray-300 text-center text-gray-800">
                        ${(item.qty * item.unitCost).toFixed(2)}
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block  md:hidden space-y-4">
            <h2 className="text-lg font-normal">SCOPE OF WORK </h2>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="text"
                placeholder="Quantity"
                value={estimateData.poNumber}
                onChange={(e) =>
                  setEstimateData({
                    ...estimateData,
                    poNumber: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Unit
              </label>
              <input
                type="text"
                placeholder="Unit"
                value={estimateData.unit}
                onChange={(e) =>
                  setEstimateData({
                    ...estimateData,
                    unit: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Unit Cost
              </label>
              <input
                type="text"
                placeholder="Unit Cost"
                value={estimateData.unitCost}
                onChange={(e) =>
                  setEstimateData({
                    ...estimateData,
                    unitCost: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Price
              </label>
              <input
                type="text"
                placeholder="Price"
                value={estimateData.price}
                onChange={(e) =>
                  setEstimateData({
                    ...estimateData,
                    price: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={6}
                placeholder="Description"
                value={estimateData.description}
                onChange={(e) =>
                  setEstimateData({
                    ...estimateData,
                    description: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                rows={6}
                placeholder="Notes"
                value={estimateData.notes}
                onChange={(e) =>
                  setEstimateData({
                    ...estimateData,
                    notes: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <div className="border border-dashed border-primary mt-3 flex justify-center md:justify-start rounded-2xl md:rounded-none">
            <button
              onClick={handleAddLineItem}
              className="py-3 px-4 text-primary border-t border-gray-300 hover:bg-orange-50 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Line Item
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-[356px] flex flex-col space-y-3">
              <div className="flex justify-between items-center border-b py-1">
                <span className="text-gray-700 font-medium">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
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
                <span className="text-orange-500 font-bold text-lg">
                  ${total.toFixed(2)}
                </span>
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
                  <MarkupModalContent
                    value={tempValue}
                    setValue={setTempValue}
                  />
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
        </div>
      </div>
    </div>
  );
}
