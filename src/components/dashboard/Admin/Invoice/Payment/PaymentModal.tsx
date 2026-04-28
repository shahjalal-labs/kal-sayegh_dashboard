import { useState } from "react";
import { MultiValue, StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";

type PaymentModalProps = {
  onClose: () => void;
  recipientEmails?: string[];
};

type EmailOption = {
  label: string;
  value: string;
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

const PaymentModal = ({ onClose, recipientEmails = [] }: PaymentModalProps) => {
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isRecordPayment, setIsRecordPayment] = useState(false);
  const [sendMeCopy, setSendMeCopy] = useState(false);
  const [showPaymentList, setShowPaymentList] = useState(false);
  const [amountMode, setAmountMode] = useState<"amount" | "percent" | "full">(
    "amount",
  );
  const [paymentMethod, setPaymentMethod] = useState<
    "cash" | "check" | "card" | "bank"
  >("cash");
  const [recipientInput, setRecipientInput] = useState("");
  const [recipients, setRecipients] = useState<EmailOption[]>(() =>
    recipientEmails
      .filter((email) => email.trim())
      .map((email) => ({ label: email, value: email })),
  );

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

  const openRecordPayment = () => {
    setIsRecordPayment(true);
    setIsReminderOpen(false);
  };

  const closeRecordPayment = () => {
    setIsRecordPayment(false);
  };

  const openReminder = () => {
    setIsReminderOpen(true);
    setIsRecordPayment(false);
  };

  const closeReminder = () => {
    setIsReminderOpen(false);
  };

  const handleClose = () => {
    setShowPaymentList(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={() => {
        if (isRecordPayment) {
          closeRecordPayment();
          return;
        }
        if (isReminderOpen) {
          closeReminder();
          return;
        }
        handleClose();
      }}
    >
      {/* Modal Box */}
      <div
        className="w-[700px] rounded-xl bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Payments</h2>
          <button
            className="bg-primary text-white px-4 py-2 rounded-md text-base"
            onClick={(event) => {
              event.stopPropagation();
              openRecordPayment();
            }}
          >
            Record Payment
          </button>
        </div>

        {/* Payment Box */}
        <div className="bg-gray-100 p-4 rounded-md">
          {/* Top Row */}
          <div className="flex justify-between text-base font-semibold mb-2">
            <p>PAID</p>
            <p className="text-gray-600">DUE $1800.00</p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-8  rounded-sm flex items-center ">
            <input
              type="text"
              defaultValue="0"
              className="w-full h-full bg-gray-400 text-white border-none p-3 focus:outline-none"
            />
          </div>

          {/* Reminder */}
          <div
            className="mt-3 flex items-center gap-2 text-primary text-base cursor-pointer"
            onClick={(event) => {
              event.stopPropagation();
              openReminder();
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
              <button
                type="button"
                className="h-9 w-12 rounded-md bg-gray-100 text-sm text-gray-700"
                aria-label="Payment actions"
              >
                ---
              </button>
            </div>

            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <p className="text-base font-semibold text-gray-400">
                  $1600.00 (Refund)
                </p>
                <p className="text-sm text-gray-400">Apr 20 Mon, 2026 / Cash</p>
              </div>
              <button
                type="button"
                className="h-9 w-12 rounded-md bg-gray-100 text-sm text-gray-700"
                aria-label="Refund actions"
              >
                ---
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-6">
          <button
            className="bg-orange-500 hover:bg-orange-600 transition-colors text-white px-6 py-2 rounded-md text-base"
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
            closeReminder();
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
                  formatCreateLabel={(value) => `Add \"${value}\"`}
                  noOptionsMessage={() =>
                    recipientInput.trim()
                      ? "No matching emails"
                      : "Type to see suggestions"
                  }
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
                  defaultValue="Follow-up on Invoice #648"
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
                <p className="text-sm leading-6 text-gray-500">
                  We are following up to confirm whether you have had an
                  opportunity to review the invoice that was previously sent.
                </p>
              </div>
            </div>

            <div className="mt-10 flex items-center justify-end gap-5">
              <button
                type="button"
                onClick={closeReminder}
                className="min-w-[112px] rounded-xl border border-primary px-6 py-3 text-base text-primary transition-colors hover:bg-primary hover:text-white"
              >
                Close
              </button>
              <button
                type="button"
                className="min-w-[112px] rounded-xl bg-primary px-6 py-3 text-base text-white transition-colors hover:opacity-90"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {isRecordPayment && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4"
          onClick={(event) => {
            event.stopPropagation();
            closeRecordPayment();
          }}
        >
          <div
            className="w-full max-w-[700px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={closeRecordPayment}
                className="text-gray-600 hover:text-black"
                aria-label="Back"
              >
                ←
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                Record Payment
              </h2>
            </div>

            <div className="mb-6 rounded-xl bg-gray-100 p-4">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-700">PAID</span>
                <span className="text-gray-500">DUE $200.00</span>
              </div>
              <div className="h-8 w-full overflow-hidden rounded-sm bg-gray-300">
                <div className="flex h-full w-[80%] items-center bg-green-700 px-3 text-xs text-white">
                  USD $0.00 of $1,800.00
                </div>
              </div>
            </div>

            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Record Payment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Amount</label>
                <div className="flex mt-2 gap-3">
                  <input
                    type="text"
                    placeholder="$ 1600.00"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAmountMode("amount")}
                      className={`px-4 text-sm font-semibold transition-colors ${
                        amountMode === "amount"
                          ? "bg-orange-500 text-white"
                          : "text-gray-500"
                      }`}
                    >
                      $
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountMode("percent")}
                      className={`px-4 text-sm border-l border-gray-300 transition-colors ${
                        amountMode === "percent"
                          ? "bg-orange-500 text-white"
                          : "text-gray-500"
                      }`}
                    >
                      %
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmountMode("full")}
                      className={`px-4 text-sm border-l border-gray-300 transition-colors ${
                        amountMode === "full"
                          ? "bg-orange-500 text-white"
                          : "text-gray-500"
                      }`}
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-400">
                    📅
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Payment Method</label>
                <div className="grid grid-cols-4 gap-0 border border-gray-300 rounded-lg overflow-hidden mt-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-2 text-sm transition-colors ${
                      paymentMethod === "cash"
                        ? "bg-orange-500 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("check")}
                    className={`py-2 text-sm border-l border-gray-300 transition-colors ${
                      paymentMethod === "check"
                        ? "bg-orange-500 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Check
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 text-sm border-l border-gray-300 transition-colors ${
                      paymentMethod === "card"
                        ? "bg-orange-500 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`py-2 text-sm border-l border-gray-300 transition-colors ${
                      paymentMethod === "bank"
                        ? "bg-orange-500 text-white"
                        : "text-gray-500"
                    }`}
                  >
                    Bank Transfer
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={closeRecordPayment}
                className="min-w-[100px] rounded-lg border border-orange-400 px-5 py-2 text-sm text-orange-500 hover:bg-orange-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPaymentList(true);
                  closeRecordPayment();
                }}
                className="min-w-[100px] rounded-lg bg-orange-500 px-5 py-2 text-sm text-white hover:opacity-90"
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
