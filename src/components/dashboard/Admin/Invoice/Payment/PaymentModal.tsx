import { useSendInvoiceMailMutation } from "@/redux/api/admin/invoiceApi";
import { LucideMoreHorizontal } from "lucide-react";
import { useState } from "react";
import { MultiValue, StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";

type PaymentModalProps = {
  onClose: () => void;
  invoiceId: string;
  invoiceName?: string;
  recipientEmails?: string[];
};

type EmailOption = {
  label: string;
  value: string;
};

type PaymentTransaction = {
  id: string;
  type: "payment" | "refund";
  amount: number;
  date: string;
  method: string;
  checkNumber?: string;
  description?: string;
  status?: string;
};

type PaymentMethod = "CASH" | "CHECK" | "CARD" | "BANK_TRANSFER";
type AmountMode = "$" | "%" | "FULL";

type RecordPaymentForm = {
  amount: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  checkNumber: string;
  amountMode: AmountMode;
};

const recipientSelectStyles: StylesConfig<EmailOption, true> = {
  control: (base) => ({
    ...base,
    minHeight: "48px",
    borderRadius: "0.75rem",
    borderColor: "#e5e7eb",
    boxShadow: "none",
    padding: "2px 6px",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#f3f4f6",
    borderRadius: "0.5rem",
    padding: "2px 4px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#6b7280",
    fontSize: "0.875rem",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#9ca3af",
    ":hover": {
      backgroundColor: "transparent",
      color: "#4b5563",
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: "0.75rem",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
    zIndex: 70,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#f9fafb" : "#ffffff",
    color: "#374151",
    fontSize: "0.875rem",
  }),
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value || 0);

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const PaymentModal = ({
  onClose,
  invoiceId,
  invoiceName,
  recipientEmails = [],
}: PaymentModalProps) => {
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isRecordPayment, setIsRecordPayment] = useState(false);
  const [showPaymentList, setShowPaymentList] = useState(false);

  const [sendMeCopy, setSendMeCopy] = useState(false);
  const [recipientInput, setRecipientInput] = useState("");
  const [recordPaymentForm, setRecordPaymentForm] = useState<RecordPaymentForm>(
    {
      amount: "",
      paymentDate: "",
      paymentMethod: "CASH",
      checkNumber: "",
      amountMode: "$",
    },
  );

  const [recipients, setRecipients] = useState<EmailOption[]>(() =>
    recipientEmails
      .filter((email) => email.trim())
      .map((email) => ({ label: email, value: email })),
  );

  const [subject, setSubject] = useState(
    invoiceName
      ? `Your Invoice ${invoiceName}`
      : "Your Invoice from Geo Paving and Sealcoating",
  );
  const [message, setMessage] = useState(
    "We are following up to confirm whether you have had an opportunity to review the invoice that was previously sent.",
  );

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeTransaction, setActiveTransaction] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refund, setrefund] = useState({
    amount: 0,
    reason: "",
  });
  const [activeActionModal, setActiveActionModal] = useState<
    "details" | "refund" | null
  >(null);

  const [sendInvoiceMail, { isLoading: isSendingReminder }] =
    useSendInvoiceMailMutation();

  const totalDue = 1800;
  const totalPaid = 0;
  const paidPercentage = 80;
  const transactions: PaymentTransaction[] = [];

  const calculatedRecordAmount = (() => {
    const numericAmount = Number(recordPaymentForm.amount || 0);

    if (recordPaymentForm.amountMode === "FULL") {
      return totalDue;
    }

    if (recordPaymentForm.amountMode === "%") {
      return (totalDue * numericAmount) / 100;
    }

    return numericAmount;
  })();

  const amountPlaceholder =
    recordPaymentForm.amountMode === "$"
      ? "$"
      : recordPaymentForm.amountMode === "%"
        ? "Amount"
        : "Full amount";

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const addRecipient = (value: string) => {
    const email = value.trim();
    if (!email || !isValidEmail(email)) return;

    setRecipients((prev) => {
      if (
        prev.some((item) => item.value.toLowerCase() === email.toLowerCase())
      ) {
        return prev;
      }
      return [...prev, { label: email, value: email }];
    });

    setRecipientInput("");
  };

  const handleRecipientsChange = (newValue: MultiValue<EmailOption>) => {
    setRecipients([...newValue]);
  };

  const handleClose = () => {
    setShowPaymentList(false);
    setActiveMenuId(null);
    setActiveActionModal(null);
    setIsReminderOpen(false);
    setIsRecordPayment(false);
    onClose();
  };

  const handleSendReminder = async () => {
    const to = recipients
      .map((recipient) => recipient.value.trim())
      .filter((email) => email.length > 0);

    if (!invoiceId) {
      toast.error("Invoice id is missing.");
      return;
    }

    if (to.length === 0) {
      toast.error("Please add at least one recipient email.");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }

    try {
      await sendInvoiceMail({
        invoiceId,
        data: {
          message: message.trim(),
          sendMeCopy,
          subject: subject.trim(),
          to,
        },
      }).unwrap();

      toast.success("Payment reminder sent successfully.");
      setIsReminderOpen(false);
    } catch (error) {
      toast.error((error as any)?.data?.message || "Failed to send reminder.");
    }
  };

  const handleRecordPayment = async () => {
    toast.success(`Payment of ${formatCurrency(calculatedRecordAmount)} recorded.`);
    setIsRecordPayment(false);
  };

  const handleRefund = async () => {
    toast.success(`Refund of ${formatCurrency(Number(refundAmount || 0))} prepared.`);
    setActiveActionModal(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(event) => {
        event.stopPropagation();
        handleClose();
      }}
    >
      <div
        className="w-full max-w-[700px] rounded-2xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payments</h2>
          <button
            className="bg-primary text-white px-4 py-2 rounded-md text-base"
            onClick={() => {
              setIsRecordPayment(true);
              setIsReminderOpen(false);
            }}
          >
            Record Payment
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <div className="flex justify-between text-base font-semibold mb-2">
            <p>PAID</p>
            <p className="text-gray-600">DUE $1800.00</p>
          </div>

          <div className="w-full h-8 rounded-sm flex items-center">
            <input
              type="text"
              defaultValue="0"
              className="w-full h-full bg-gray-400 text-white border-none p-3 focus:outline-none"
            />
          </div>

          <div
            className="mt-3 flex items-center gap-2 text-primary text-base cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              setIsReminderOpen(true);
              setIsRecordPayment(false);
            }}
          >
            <span>Send Payment Reminder</span>
            <span>→</span>
          </div>
        </div>

        {showPaymentList && (
          <div className="mt-6 space-y-4">
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <p className="text-base font-semibold text-gray-900">
                  $1600.00
                </p>
                <p className="text-sm text-gray-500">Apr 20 Mon, 2026 / Cash</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuId((prev) =>
                      prev === "payment" ? null : "payment",
                    )
                  }
                  className="h-9 w-12 rounded-md bg-gray-100 text-sm text-gray-700"
                  aria-label="Payment actions"
                >
                  ---
                </button>
                {activeMenuId === "payment" && (
                  <div className="absolute right-0 top-11 z-10 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveActionModal("details");
                        setActiveMenuId(null);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveActionModal("refund");
                        setActiveMenuId(null);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Issue Refund
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <p className="text-base font-semibold text-gray-400">
                  $1600.00 (Refund)
                </p>
                <p className="text-sm text-gray-400">Apr 20 Mon, 2026 / Cash</p>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuId((prev) =>
                      prev === "refund" ? null : "refund",
                    )
                  }
                  className="h-9 w-12 rounded-md bg-gray-100 text-sm text-gray-700"
                  aria-label="Refund actions"
                >
                  ---
                </button>
                {activeMenuId === "refund" && (
                  <div className="absolute right-0 top-11 z-10 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveActionModal("details");
                        setActiveMenuId(null);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveActionModal("refund");
                        setActiveMenuId(null);
                      }}
                      className="block w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                    >
                      Issue Refund
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="bg-primary hover:bg-orange-600 transition-colors text-white px-6 py-2 rounded-md text-base"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>

      {isReminderOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            event.stopPropagation();
            handleClose();
          }}
        >
          <div
            className="w-full max-w-[700px] rounded-2xl bg-white p-6 shadow-xl md:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Send Payment Reminder
            </h2>

            <div className="mt-8 space-y-8">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  To
                </label>
                <CreatableSelect<EmailOption, true>
                  isMulti
                  components={{
                    DropdownIndicator: null,
                    IndicatorSeparator: null,
                  }}
                  value={recipients}
                  onChange={handleRecipientsChange}
                  onCreateOption={addRecipient}
                  inputValue={recipientInput}
                  onInputChange={(value) => {
                    setRecipientInput(value);
                    return value;
                  }}
                  isValidNewOption={(inputValue) => {
                    const email = inputValue.trim();
                    return (
                      isValidEmail(email) &&
                      !recipients.some(
                        (item) =>
                          item.value.toLowerCase() === email.toLowerCase(),
                      )
                    );
                  }}
                  formatCreateLabel={(value) => `Add "${value}"`}
                  noOptionsMessage={() => null}
                  placeholder="Type email and press Enter"
                  styles={recipientSelectStyles}
                />
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setSendMeCopy((prev) => !prev)}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full px-1 transition-colors ${
                    sendMeCopy ? "bg-primary" : "bg-gray-200"
                  }`}
                  aria-label="Send me a copy toggle"
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      sendMeCopy ? "translate-x-8" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Send me a copy
                </span>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary"
                  placeholder="Write your reminder message"
                />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-end gap-5">
              <button
                type="button"
                onClick={() => setIsReminderOpen(false)}
                className="min-w-[112px] rounded-xl border border-primary px-6 py-3 text-base text-primary transition-colors hover:bg-primary hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                className="min-w-[112px] rounded-xl bg-primary px-6 py-3 text-base text-white transition-colors hover:opacity-90"
                onClick={handleSendReminder}
                disabled={isSendingReminder}
              >
                {isSendingReminder ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeActionModal === "details" && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setActiveActionModal(null);
          }}
        >
          <div
            className="w-full max-w-[540px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="text-gray-600 hover:text-black"
                aria-label="Back"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                Payment Details
              </h2>
            </div>

            <div className="rounded-xl bg-gray-100 py-8 text-center">
              <p className="text-base uppercase font-normal">Total Amount</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">
                {formatCurrency(activeTransaction?.amount || 0)}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4 text-base text-gray-500">
              <span>Transaction Details</span>
              <span className="font-medium text-gray-700">
                {activeTransaction ? formatDate(activeTransaction.date) : "-"}
              </span>
            </div>

            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p>Method: {activeTransaction?.method || "-"}</p>
              {activeTransaction?.checkNumber ? (
                <p>Check Number: {activeTransaction.checkNumber}</p>
              ) : null}
              {activeTransaction?.description ? (
                <p>Description: {activeTransaction.description}</p>
              ) : null}
              {activeTransaction?.status ? (
                <p>Status: {activeTransaction.status}</p>
              ) : null}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="min-w-[112px] rounded-lg bg-primary px-6 py-2 text-sm text-white hover:opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {activeActionModal === "refund" && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setActiveActionModal(null);
          }}
        >
          <div
            className="w-full max-w-[560px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Issue Refund
            </h2>

            <input
              type="number"
              value={refundAmount}
              onChange={(event) => setRefundAmount(event.target.value)}
              inputMode="decimal"
              aria-label="Refund amount"
              className="border border-gray-300 p-2 outline-none focus:ring-1 focus:ring-primary w-full rounded-lg mt-4"
            />
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to refund{" "}
              {formatCurrency(activeTransaction?.amount || 0)}?
            </p>

            <input
              type="text"
              value={refund.reason}
              placeholder="Refund Reason"
              onChange={(e) => {
                setrefund((prev) => ({ ...prev, reason: e.target.value }));
              }}
              className="border border-gray-300 p-2 outline-none focus:ring-1 focus:ring-primary w-full rounded-lg mt-4"
            />
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setActiveActionModal(null)}
                className="min-w-[120px] rounded-lg border border-primary hover:text-white hover:bg-primary px-5 py-2 text-base text-primary hover:opacity-90 transition-all duration-300 ease-in"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                type="button"
                className="min-w-[140px] rounded-lg bg-primary px-5 py-2 text-base text-white hover:opacity-90 transition-all duration-300 ease-in"
              >
                Issue Refunded
              </button>
            </div>
          </div>
        </div>
      )}

      {isRecordPayment && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setIsRecordPayment(false);
          }}
        >
          <div
            className="w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsRecordPayment(false)}
                className="text-gray-600 hover:text-black"
                aria-label="Back"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                Record Payment
              </h2>
            </div>

            <div className="mb-6 rounded-xl bg-gray-100 p-4 text-base">
              <div className="mb-2 flex justify-between text-xs font-normal">
                <span className="text-base">PAID</span>
                <span className="text-base font-normal">
                  DUE {formatCurrency(totalDue)}
                </span>
              </div>
              <div className=" w-full overflow-hidden rounded-sm bg-gray-300">
                <div
                  className="flex h-full items-center justify-between bg-green-700 px-3 py-3 text-base text-white transition-all duration-300"
                  style={{ width: `${paidPercentage}%` }}
                >
                  <span>{formatCurrency(totalPaid)}</span>

                  <span className="mx-2">of</span>

                  <span>{formatCurrency(totalDue)}</span>
                </div>
              </div>
            </div>

            <h3 className="mb-3 text-base font-semibold text-gray-900">
              Record Payment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Amount</label>
                <div className="mt-2 flex gap-3">
                  <input
                    type="text"
                    value={recordPaymentForm.amount}
                    placeholder={amountPlaceholder}
                    onChange={(e) =>
                      setRecordPaymentForm((prev) => ({
                        ...prev,
                        amount: e.target.value.replace(/[^0-9.]/g, ""),
                      }))
                    }
                    className="w-full rounded-lg border px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex overflow-hidden rounded-lg border border-gray-300 w-56">
                    <button
                      type="button"
                      onClick={() =>
                        setRecordPaymentForm((prev) => ({
                          ...prev,
                          amountMode: "$",
                          amount: "",
                        }))
                      }
                      className={`border-r border-gray-300 px-4 text-sm font-semibold ${recordPaymentForm.amountMode === "$" ? "text-white bg-primary" : "text-gray-500"}`}
                    >
                      $
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRecordPaymentForm((prev) => ({
                          ...prev,
                          amountMode: "%",
                          amount: "",
                        }))
                      }
                      className={`border-r border-gray-300 px-4 text-sm ${recordPaymentForm.amountMode === "%" ? "text-white bg-primary" : "text-gray-500"}`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setRecordPaymentForm((prev) => ({
                          ...prev,
                          amountMode: "FULL",
                          amount: String(totalDue),
                        }))
                      }
                      className={`px-4 text-sm ${recordPaymentForm.amountMode === "FULL" ? "text-white bg-primary" : "text-gray-500"}`}
                    >
                      FULL
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Payment Date</label>

                <div className="relative mt-2">
                  <input
                    type="date"
                    value={recordPaymentForm.paymentDate}
                    onChange={(e) =>
                      setRecordPaymentForm((prev) => ({
                        ...prev,
                        paymentDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary "
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Payment Method</label>
                <div className="mt-2 grid grid-cols-4 overflow-hidden rounded-lg border border-gray-300">
                  <button
                    type="button"
                    onClick={() =>
                      setRecordPaymentForm((prev) => ({
                        ...prev,
                        paymentMethod: "CASH",
                        checkNumber: "",
                      }))
                    }
                    className={`py-2 text-sm ${recordPaymentForm.paymentMethod === "CASH" ? "bg-primary text-white" : "text-gray-500"}`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRecordPaymentForm((prev) => ({
                        ...prev,
                        paymentMethod: "CHECK",
                      }))
                    }
                    className={`border-l border-gray-300 py-2 text-sm ${recordPaymentForm.paymentMethod === "CHECK" ? "bg-primary text-white" : "text-gray-500"}`}
                  >
                    Check
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRecordPaymentForm((prev) => ({
                        ...prev,
                        paymentMethod: "CARD",
                        checkNumber: "",
                      }))
                    }
                    className={`border-l border-gray-300 py-2 text-sm ${recordPaymentForm.paymentMethod === "CARD" ? "bg-primary text-white" : "text-gray-500"}`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRecordPaymentForm((prev) => ({
                        ...prev,
                        paymentMethod: "BANK_TRANSFER",
                        checkNumber: "",
                      }))
                    }
                    className={`border-l border-gray-300 py-2 text-sm ${recordPaymentForm.paymentMethod === "BANK_TRANSFER" ? "bg-primary text-white" : "text-gray-500"}`}
                  >
                    Bank Transfer
                  </button>
                </div>
                {recordPaymentForm.paymentMethod === "CHECK" && (
                  <div className="mt-3">
                    <label className="text-sm text-gray-600">
                      Check Number
                    </label>
                    <input
                      type="text"
                      value={recordPaymentForm.checkNumber}
                      onChange={(event) =>
                        setRecordPaymentForm((prev) => ({
                          ...prev,
                          checkNumber: event.target.value,
                        }))
                      }
                      placeholder="CHK123456"
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsRecordPayment(false)}
                className="min-w-[100px] rounded-lg border border-orange-400 px-5 py-2 text-sm text-primary hover:opacity-90"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                className="min-w-[100px] rounded-lg bg-primary px-5 py-2 text-sm text-white hover:opacity-90"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentModal;
