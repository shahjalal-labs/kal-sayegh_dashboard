"use client";

import { ArrowLeft, Calendar, Plus, User } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

interface LineItem {
  id: string;
  description: string;
  qty: number;
  unit: string;
  unitCost: number;
}

export default function EstimateTable() {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: "1",
      description: "Description",
      qty: 2435,
      unit: "SF",
      unitCost: 18.0,
    },
    {
      id: "2",
      description: "Notes",
      qty: 0,
      unit: "",
      unitCost: 0,
    },
  ]);

  const [estimateData, setEstimateData] = useState({
    estimateNumber: "",
    date: "02-27-2026",
    expirationDate: "02-27-2026",
    poNumber: "",
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
  return (
    <div>
      <div className="flex gap-3 justify-between">
        <Link
          href={"/admin/estimate"}
          className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-orange-500 transition"
        >
          <ArrowLeft size={18} />
          <h2 className="text-lg font-normal">Back to Estimate</h2>
        </Link>
        <div className="space-x-4">
          <button className="px-6 py-2 border-[1px] border-primary text-primary hover:bg-primary transition-colors duration-300 hover:text-white rounded-xl ">
            Cancel
          </button>
          <button className="px-6 py-2 bg-primary hover:bg-primary/90  text-white font-normal rounded-xl transition-colors">
            Submit Estimate
          </button>
        </div>
      </div>
      <div className="bg-secondary rounded-lg overflow-hidden shadow-md mt-10">
        <div className=" px-8 py-6 flex justify-between ">
          <div>
            <p className="text-gray-600 font-normal">United States</p>
            <p className="text-gray-600">example03@gmail.com</p>
          </div>

          <div className="p-6 space-y-6 w-[456px]">
            <div className="border-dashed border-[#67C118] border-2 p-6 h-[167px] flex justify-center items-center rounded-2xl">
              <button className="text-primary hover:text-orange-600 flex items-center justify-center gap-2 font-semibold transition-colors">
                <User size={20} />
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
          </div>
        </div>

        <div className="p-6">
          {/* Table */}
          <div className="overflow-x-auto  rounded-sm">
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

          <div className="border border-primary mt-3">
            <button
              onClick={handleAddLineItem}
              className="w-full py-3 text-left px-4 text-primary border-t border-gray-300 hover:bg-orange-50 flex items-center gap-2"
            >
              <Plus size={18} />
              Add Line Item
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-[356px] flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Markup</span>
                {markup !== null ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={markup}
                      onChange={(e) =>
                        setMarkup(parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setMarkup(0)}
                    className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                  >
                    Add
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Discount</span>
                {discount !== null ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) =>
                        setDiscount(parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setDiscount(0)}
                    className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
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
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) =>
                        setDeposit(parseFloat(e.target.value) || 0)
                      }
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeposit(0)}
                    className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
