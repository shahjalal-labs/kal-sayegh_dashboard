"use client";

import { Calendar, Plus, User } from "lucide-react";
import { useState } from "react";

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
      <div className="flex gap-3 justify-end">
        <button className="px-6 py-2 border-[1px] border-primary text-primary hover:bg-primary transition-colors duration-300 hover:text-white rounded-xl ">
          Cancel
        </button>
        <button className="px-6 py-2 bg-primary hover:bg-primary/90  text-white font-normal rounded-xl transition-colors">
          Submit Estimate
        </button>
      </div>
      <div className="bg-secondary rounded-lg overflow-hidden shadow-lg mt-10">
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
          {/* Line Items Table */}
          <div className="overflow-x-auto rounded-lg shadow-sm ">
            <table className="w-full min-w-max">
              <thead>
                <tr className="">
                  <th className="text-left  py-4 font-semibold text-gray-800 border-b border-gray-300">
                    SCOPE OF WORK
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-gray-800 border-b border-gray-300 w-32">
                    QTY
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-gray-800 border-b border-gray-300 w-32">
                    UNIT
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-gray-800 border-b border-gray-300 w-32">
                    UNIT COST
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-gray-800 border-b border-gray-300 w-32">
                    PRICE
                  </th>
                  <th className="w-12 px-2 py-4 border-b border-gray-300"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className=" py-4">
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
                        className="w-full px-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                      />
                    </td>
                    <td className="px-4 py-4">
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
                        className="w-full text-center px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          handleLineItemChange(item.id, "unit", e.target.value)
                        }
                        placeholder="Unit"
                        className="w-full text-center px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                      />
                    </td>
                    <td className="px-4 py-4">
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
                        className="w-full text-center px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                      />
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-gray-700">
                      ${(item.qty * item.unitCost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={handleAddLineItem}
              className="mt-6 w-full p-4 border-[1px] border-primary text-primary font-semibold rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-start  gap-2"
            >
              <Plus size={20} />
              Add Line Item
            </button>
          </div>

          {/* Summary Section */}
          <div className="space-y-3 pt-6 w-[556px] ">
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
                    onChange={(e) => setMarkup(parseFloat(e.target.value) || 0)}
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
  );
}
