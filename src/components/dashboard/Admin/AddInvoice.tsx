"use client";

import CommonEstimateTable from "@/components/table/CommonEstimateTable";
import {
  useCreateClientMutation,
  useGetMyClientsQuery,
} from "@/redux/api/admin/estimateApi";
import { useCreateInvoiceMutation } from "@/redux/api/admin/invoiceApi";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AiOutlineUserAdd } from "react-icons/ai";

export default function AddInvoice() {
  const [createInvoice, { isLoading }] = useCreateInvoiceMutation();

  const [formData, setFormData] = useState({
    invoiceName: "",
    date: "",
    poNumber: "",
    daysToPay: "",
    endDate: "",
    clientId: "",
  });

  const [tableData, setTableData] = useState<any>(null);
  const [tableKey, setTableKey] = useState(0);

  const [open, setOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const [showAll, setShowAll] = useState(false);
  const [openClientModal, setOpenClientModal] = useState(false);

  const { data } = useGetMyClientsQuery({});
  const myClients = data?.result;

  const [createClient] = useCreateClientMutation();

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

  const handleCreateClient = async () => {
    try {
      await createClient(clientForm).unwrap();
      setOpenClientModal(false);
      setClientForm({
        clientName: "",
        email: "",
        phoneNumber: "",
        address: "",
        city: "",
        state: "",
        zip: "",
      });
      // Optionally refetch clients
    } catch (error) {
      console.error("Failed to create client:", error);
    }
  };

  const handleSubmit = async () => {
    if (!tableData) return;

    const bodyData = {
      additionalMarkUp: tableData.summaryMarkup?.percentage || 0,
      clientId: formData.clientId,
      date: formData.date,
      depositAmount: Math.round(tableData.summaryDeposit?.value || 0),
      discountAmount: Math.round(tableData.summaryDiscount?.value || 0),
      endDate: formData.endDate,
      grandTotal: Math.round(tableData.grandTotal),
      invoiceName: formData.invoiceName,
      items: tableData.items
        .filter((item: any) => item.selectedItem)
        .map((item: any) => ({
          id: item.selectedItem.id,
          quantity: parseFloat(item.quantity) || 1,
          subTotal: Math.round(item.total),
        })),
    };

    try {
      await createInvoice(bodyData).unwrap();
      setFormData({
        invoiceName: "",
        date: "",
        poNumber: "",
        daysToPay: "",
        endDate: "",
        clientId: "",
      });
      setSelectedClient(null);
      setTableData(null);
      setTableKey((prev) => prev + 1);
      setOpen(false);
      setShowAll(false);
    } catch (error) {
      console.error("Failed to create invoice:", error);
    }
  };

  return (
    <div>
      <Link
        href={"/admin/invoice"}
        className="hidden md:flex items-center gap-2 p-2 rounded-lg hover:text-primary text-base font-medium"
      >
        <ArrowLeft className="mt-[1px]" size={20} />
        <span>Back to invoices</span>
      </Link>
      <div className="min-h-screen p-6 bg-secondary rounded-2xl shadow-sm mt-4">
        <div className="">
          <div className="flex items-center justify-between mb-4  md:hidden">
            {/* Left Arrow */}
            <Link
              href={"/admin/invoice"}
              className="p-2 rounded-lg  flex items-center gap-2"
            >
              <ArrowLeft size={20} />
            </Link>

            {/* Title */}
            <h2 className="text-xl font-semibold text-center flex-1 block">
              Invoices
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
              {isLoading ? "Submitting..." : "Submit Invoice"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            {/* Left */}
            <div className="col-span-2 hidden md:block">
              <p className="text-sm text-gray-500">United States</p>
              <p className="text-sm text-gray-500">example03@gmail.com</p>
            </div>

            {/* Right Form */}
            <div className="space-y-4 mt-10 md:mt-10">
              <div
                onClick={() => setOpenClientModal(true)}
                className="border border-dashed border-primary bg-orange-50 hover:bg-orange-100 rounded-xl p-10 flex items-center justify-center text-orange-500 cursor-pointer  duration-300"
              >
                <AiOutlineUserAdd className="mr-2 inline-block" size={20} />
                <span>Add Client</span>
              </div>
              <div>
                {/* Button */}
                <button
                  onClick={() => setOpen(true)}
                  className="border-primary border rounded-xl px-6 py-2 text-primary hover:bg-primary hover:text-white transition w-full md:w-auto"
                >
                  {selectedClient
                    ? selectedClient.clientName
                    : "View All Client"}
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
                        {myClients.length > 0 ? (
                          myClients.map((client: any) => (
                            <div
                              key={client.id}
                              onClick={() => {
                                setSelectedClient(client);
                                setFormData((prev) => ({
                                  ...prev,
                                  clientId: client.id,
                                }));
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

                      {/* Footer */}
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

              <div className="space-y-2">
                <label>Invoice</label>
                <input
                  placeholder="Invoice#"
                  className="input w-full"
                  value={formData.invoiceName}
                  onChange={(e) =>
                    setFormData((prev) => ({
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
                  className="input w-full"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label>End Date</label>
                <input
                  type="date"
                  className="input w-full"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label>PO Number</label>
                <input
                  placeholder="PO Number"
                  className="input w-full"
                  value={formData.poNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      poNumber: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label>Days to pay</label>
                <input
                  placeholder="Days to pay"
                  className="input w-full"
                  value={formData.daysToPay}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      daysToPay: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>

          <CommonEstimateTable key={tableKey} onDataChange={setTableData} />

          <button
            onClick={handleSubmit}
            className="px-5 py-2 mt-7 md:hidden rounded-lg bg-primary text-white hover:bg-primary/90 w-full transition-colors"
          >
            Submit
          </button>
        </div>

        {openClientModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div className="bg-white w-full max-w-[700px] p-4 md:p-6 rounded-xl shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-semibold mb-4">Add Client</h2>

              {/* Client Name */}
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

              {/* Email + Phone */}
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

              {/* Address */}
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

              {/* City + State */}
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

              {/* Zip */}
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

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setOpenClientModal(false)}
                  className="px-8 py-2 border border-primary rounded-xl hover:text-white hover:bg-primary transition-colors duration-300"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateClient}
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
