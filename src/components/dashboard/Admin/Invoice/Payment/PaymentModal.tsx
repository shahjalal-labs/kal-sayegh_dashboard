import {
  useGetInvoicePaymentsQuery,
  useInvoiceManualPaymentMutation,
  useRefundPaymentMutation,
  useSendInvoiceMailMutation,
} from "@/redux/api/admin/invoiceApi";
import { useEffect, useState } from "react";
import { MultiValue, StylesConfig } from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "sonner";

type PaymentModalProps = {
  onClose: () => void;
  invoiceId: string;
  invoiceName?: string;
  recipientEmails?: string[];
  totalDue?: number;
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

const normalizePaymentRecords = (data: any): PaymentTransaction[] => {
  const rawRecords = Array.isArray(data)
    ? data
    : Array.isArray(data?.result)
      ? data.result
      : Array.isArray(data?.result?.data)
        ? data.result.data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.payments)
            ? data.payments
            : [];

  return rawRecords.map((record: any, index: number) => ({
    id: String(record?.id || record?._id || index),
    type:
      String(record?.type || record?.kind || "payment").toLowerCase() ===
      "refund"
        ? "refund"
        : "payment",
    amount: Number(
      record?.amount ?? record?.paidAmount ?? record?.paymentAmount ?? 0,
    ),
    date: String(
      record?.paymentDate || record?.date || record?.createdAt || "",
    ),
    method: String(record?.paymentMethod || record?.method || "Cash"),
    checkNumber: record?.checkNumber,
    description: record?.description,
    status: record?.status,
  }));
};

const PaymentModal = ({
  onClose,
  invoiceId,
  invoiceName,
  recipientEmails = [],
  totalDue: totalDueProp = 0,
}: PaymentModalProps) => {
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isRecordPayment, setIsRecordPayment] = useState(false);
  const [showPaymentList, setShowPaymentList] = useState(true);

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

  useEffect(() => {
    setRecipients(
      recipientEmails
        .filter((email) => email.trim())
        .map((email) => ({ label: email, value: email })),
    );
  }, [recipientEmails]);

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

  const { data: paymentsData, refetch: refetchPayments } =
    useGetInvoicePaymentsQuery(invoiceId, {
      skip: !invoiceId,
    });

  const summary = paymentsData?.result?.summary;

  const [recordInvoicePayment, { isLoading: isRecordingPayment }] =
    useInvoiceManualPaymentMutation();
  const [issueRefund, { isLoading: isRefundingPayment }] =
    useRefundPaymentMutation();

  const [sendInvoiceMail, { isLoading: isSendingReminder }] =
    useSendInvoiceMailMutation();

  const totalDue = Number(summary?.totalDue ?? totalDueProp ?? 0);
  const transactions = normalizePaymentRecords(paymentsData);
  const totalPaidFromTransactions = transactions.reduce((sum, payment) => {
    const amount = Number(payment.amount || 0);
    return payment.type === "refund" ? sum - amount : sum + amount;
  }, 0);
  const totalPaid = Number(
    summary?.totalPaid ?? totalPaidFromTransactions ?? 0,
  );
  const paidPercentage =
    totalDue > 0
      ? Math.min(100, Math.max(0, (totalPaid / totalDue) * 100))
      : totalPaid > 0
        ? 100
        : 0;

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

  useEffect(() => {
    if (recordPaymentForm.amountMode === "FULL") {
      setRecordPaymentForm((prev) => ({
        ...prev,
        amount: String(totalDue || 0),
      }));
    }
  }, [recordPaymentForm.amountMode, totalDue]);

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
        payload: {
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
    if (!invoiceId) {
      toast.error("Invoice id is missing.");
      return;
    }

    if (!calculatedRecordAmount || calculatedRecordAmount <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }

    // convert date input (YYYY-MM-DD) to ISO datetime (UTC) expected by backend
    const paymentDateIso = ((): string => {
      const raw = recordPaymentForm.paymentDate;
      if (!raw) return new Date().toISOString();
      const parts = raw.split("-");
      if (parts.length !== 3) return new Date(raw).toISOString();
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2]);
      return new Date(Date.UTC(y, m, d, 0, 0, 0)).toISOString();
    })();

    try {
      await recordInvoicePayment({
        invoiceId,
        payload: {
          amount: calculatedRecordAmount,
          amountMode: recordPaymentForm.amountMode,
          paymentDate: paymentDateIso,
          paymentMethod: recordPaymentForm.paymentMethod,
          checkNumber:
            recordPaymentForm.paymentMethod === "CHECK"
              ? recordPaymentForm.checkNumber.trim()
              : "",
        },
      }).unwrap();

      toast.success(
        `Payment of ${formatCurrency(calculatedRecordAmount)} recorded.`,
      );
      setIsRecordPayment(false);
      await refetchPayments();
    } catch (error) {
      toast.error((error as any)?.data?.message || "Failed to record payment.");
    }
  };

  const handleRefund = async () => {
    if (!activeTransaction?.id) {
      toast.error("Select a payment to refund.");
      return;
    }

    const amount = Number(refundAmount || activeTransaction?.amount || 0);

    if (!amount || amount <= 0) {
      toast.error("Enter a valid refund amount.");
      return;
    }

    try {
      await issueRefund({
        paymentId: activeTransaction.id,
        payload: {
          amount,
          reason: refund.reason.trim(),
        },
      }).unwrap();

      toast.success(`Refund of ${formatCurrency(amount)} prepared.`);
      setActiveActionModal(null);
      setRefundAmount("");
      setrefund({ amount: 0, reason: "" });
      await refetchPayments();
    } catch (error) {
      toast.error((error as any)?.data?.message || "Failed to issue refund.");
    }
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
          <h2 className="text-xl font-semibold">Payments</h2>
          <button
            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-base"
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
            <p className="uppercase text-xl font-normal">Paid</p>
            <p className="text-xl font-normal">DUE ${summary?.totalDue}</p>
          </div>

          <div className="w-full h-10 overflow-hidden  bg-[#8F8F8F] flex items-center">
            <div
              className="flex h-full items-center justify-between  bg-[#008000] px-3 text-white transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, paidPercentage))}%`,
              }}
            >
              <span className="whitespace-nowrap font-normal">
                {formatCurrency(totalPaid)} of {formatCurrency(totalDue)}
              </span>
            </div>
          </div>

          <div
            className="mt-3 flex items-center gap-2 text-primary hover:text-orange-400 text-base cursor-pointer"
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

        {transactions.length > 0
          ? transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-start justify-between border-b border-gray-200 pb-4"
              >
                <div>
                  <p
                    className={`text-base font-semibold ${
                      transaction.type === "refund"
                        ? "text-gray-400"
                        : "text-gray-900"
                    }`}
                  >
                    {transaction.type === "refund" ? "-" : "+"}
                    {formatCurrency(Math.abs(transaction.amount))}
                    {transaction.type === "refund" ? " (Refund)" : ""}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(transaction.date)} / {transaction.method}
                  </p>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMenuId((prev) =>
                        prev === transaction.id ? null : transaction.id,
                      )
                    }
                    className="h-9 w-12 rounded-md bg-gray-100 text-base text-gray-700"
                    aria-label={`${transaction.type} actions`}
                  >
                    ---
                  </button>
                  {activeMenuId === transaction.id && (
                    <div className="absolute right-0 top-11 z-10 w-32 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTransaction(transaction);
                          setActiveActionModal("details");
                          setActiveMenuId(null);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                      >
                        Details
                      </button>
                      {transaction.type === "payment" && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTransaction(transaction);
                            setRefundAmount(
                              String(Math.abs(transaction.amount)),
                            );
                            setActiveActionModal("refund");
                            setActiveMenuId(null);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                        >
                          Issue Refund
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          : null}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            className="bg-primary hover:bg-primary/90 transition-colors text-white px-6 py-2 rounded-md text-base"
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
                <label className="block text-lg font-medium text-gray-900">
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
                <label className="block text-lg font-medium text-gray-900">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-base text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary"
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
                <span className="text-base font-medium text-gray-700">
                  Send me a copy
                </span>
              </div>

              <div className="space-y-3">
                <label className="block text-lg font-medium text-gray-900">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base leading-6 text-gray-700 outline-none placeholder:text-gray-400 focus:border-primary"
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
            className="w-full max-w-[700px] rounded-2xl bg-white p-6 shadow-xl"
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
              <h2 className="text-xl font-semibold text-gray-900">
                Record Payment
              </h2>
            </div>

            <div className="mb-6 rounded-xl bg-gray-100 p-4 text-base">
              <div className="mb-2 flex justify-between text-xl font-normal">
                <span>PAID</span>
                <span>DUE ${summary.totalDue}</span>
              </div>
              <div className=" w-full overflow-hidden rounded-sm bg-[#8F8F8F]">
                <div
                  className="flex h-full items-center bg-[#008000] px-3 py-3 text-base text-white transition-all duration-300"
                  style={{ width: `${paidPercentage}%` }}
                >
                  <span>{formatCurrency(totalPaid)}</span>

                  <span className="mx-2">of</span>

                  <span>{formatCurrency(totalDue)}</span>
                </div>
              </div>
            </div>

            <h3 className="mb-3 text-xl font-semibold text-gray-900">
              Record Payment
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-lg text-gray-600">Amount</label>
                <div className="mt-2 flex gap-3">
                  <input
                    type="text"
                    value={
                      recordPaymentForm.amountMode === "FULL"
                        ? String(totalDue || 0)
                        : recordPaymentForm.amount
                    }
                    placeholder={amountPlaceholder}
                    onChange={(e) =>
                      recordPaymentForm.amountMode !== "FULL" &&
                      setRecordPaymentForm((prev) => ({
                        ...prev,
                        amount: e.target.value.replace(/[^0-9.]/g, ""),
                      }))
                    }
                    readOnly={recordPaymentForm.amountMode === "FULL"}
                    className={`w-full rounded-lg border px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-primary ${recordPaymentForm.amountMode === "FULL" ? "bg-gray-100" : ""}`}
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
                      className={`border-r border-gray-300 px-4 text-base font-semibold ${recordPaymentForm.amountMode === "$" ? "text-white bg-primary" : "text-gray-500"}`}
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
                      className={`border-r border-gray-300 px-4 text-base ${recordPaymentForm.amountMode === "%" ? "text-white bg-primary" : "text-gray-500"}`}
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
                      className={`px-4 text-base ${recordPaymentForm.amountMode === "FULL" ? "text-white bg-primary" : "text-gray-500"}`}
                    >
                      FULL
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-lg text-gray-600">Payment Date</label>

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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-primary "
                  />
                </div>
              </div>

              <div>
                <label className="text-lg text-gray-600">Payment Method</label>
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
                    className={`border-l border-gray-300 py-2 text-base ${recordPaymentForm.paymentMethod === "CHECK" ? "bg-primary text-white" : "text-gray-500"}`}
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
                    className={`border-l border-gray-300 py-2 text-base ${recordPaymentForm.paymentMethod === "CARD" ? "bg-primary text-white" : "text-gray-500"}`}
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
                    className={`border-l border-gray-300 py-2 text-base ${recordPaymentForm.paymentMethod === "BANK_TRANSFER" ? "bg-primary text-white" : "text-gray-500"}`}
                  >
                    Bank Transfer
                  </button>
                </div>
                {recordPaymentForm.paymentMethod === "CHECK" && (
                  <div className="mt-3">
                    <label className="text-base text-gray-600">
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
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setIsRecordPayment(false)}
                className="min-w-[100px] rounded-lg border border-primary px-5 py-2 text-base text-primary hover:bg-primary opacity-90 hover:text-white transition-all duration-300 ease-in"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleRecordPayment}
                className="min-w-[100px] rounded-lg bg-primary px-5 py-2 text-base text-white hover:opacity-90"
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
