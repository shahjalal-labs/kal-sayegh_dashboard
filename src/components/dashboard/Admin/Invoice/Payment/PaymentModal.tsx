"use client";

import {
  useGetInvoiceDetailsQuery,
  useGetInvoicePaymentsQuery,
  useInvoiceManualPaymentMutation,
  useRefundPaymentMutation,
  useSendReminderEmailMutation,
} from "@/redux/api/admin/invoiceApi";
import { LucideMoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PaymentModalProps = {
  onClose: () => void;
  invoiceId: string;
  recipientEmails?: string[];
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
  recipientEmails = [],
}: PaymentModalProps) => {
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isRecordPayment, setIsRecordPayment] = useState(false);
  const [showPaymentList, setShowPaymentList] = useState(true);

  const [sendMeCopy, setSendMeCopy] = useState(false);
  const [value, setValue] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [activeTransaction, setActiveTransaction] = useState<any>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [activeActionModal, setActiveActionModal] = useState<
    "details" | "refund" | null
  >(null);

  const { data, isLoading } = useGetInvoicePaymentsQuery(invoiceId, {
    skip: !invoiceId,
  });

  const { data: invoiceDetails } = useGetInvoiceDetailsQuery(invoiceId, {
    skip: !invoiceId,
  });

  const [invoiceReminder] = useSendReminderEmailMutation();
  const [manualPayment] = useInvoiceManualPaymentMutation();
  const [refundPayment] = useRefundPaymentMutation();

  const payments = data?.result;
  const summary = payments?.summary || {};
  const transactions = payments?.transactions || [];
  const clientEmail =
    invoiceDetails?.result?.client?.email || recipientEmails[0] || "";

  const [showClientEmail, setShowClientEmail] = useState(true);

  const [formData, setFormData] = useState({
    message: "",
    sendMeCopy: false,
    subject: "",
    to: [] as string[],
  });

  const [recordPaymentForm, setRecordPaymentForm] = useState<RecordPaymentForm>(
    {
      amount: "",
      paymentDate: "",
      paymentMethod: "CASH",
      checkNumber: "",
      amountMode: "$",
    },
  );

  const [refund, setrefund] = useState({
    amount: 0,
    reason: "",
  });

  const totalDue = summary?.totalDue || 0;
  const totalPaid = summary?.totalPaid || 0;
  const paidPercentage = summary?.paidPercentage || 0;

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

  const handleClose = () => {
    setShowPaymentList(false);
    setActiveMenuId(null);
    setActiveActionModal(null);
    setIsReminderOpen(false);
    setIsRecordPayment(false);
    onClose();
  };

  const handleInvoiceReminder = async () => {
    try {
      const reminderRecipients = Array.from(
        new Set(
          [
            ...formData.to,
            ...(showClientEmail && clientEmail ? [clientEmail] : []),
          ].filter(Boolean),
        ),
      );

      await invoiceReminder({
        invoiceId,
        message: formData.message,
        sendMeCopy: formData.sendMeCopy,
        subject: formData.subject,
        to: reminderRecipients,
      }).unwrap();
      toast.success("Invoice reminder sent successfully");

      setFormData({
        message: "",
        sendMeCopy: false,
        subject: "",
        to: [],
      });
      setShowPaymentList(false);
    } catch (error) {
      toast.error("Failed to send invoice reminder");
    }
  };

  const addRecipientEmail = (rawEmail: string) => {
    const trimmedEmail = rawEmail.trim();

    if (!trimmedEmail) {
      return;
    }

    setFormData((prev) => {
      if (prev.to.includes(trimmedEmail)) {
        return prev;
      }

      return {
        ...prev,
        to: [...prev.to, trimmedEmail],
      };
    });

    setEmailInput("");
  };

  const handleRecordPayment = async () => {
    try {
      const paymentDate = recordPaymentForm.paymentDate
        ? `${recordPaymentForm.paymentDate}T00:00:00Z`
        : "";

      await manualPayment({
        invoiceId,
        payload: {
          amount: calculatedRecordAmount,
          checkNumber:
            recordPaymentForm.paymentMethod === "CHECK"
              ? recordPaymentForm.checkNumber
              : undefined,
          paymentDate,
          paymentMethod: recordPaymentForm.paymentMethod,
        },
      }).unwrap();

      toast.success("Payment recorded successfully");
      setRecordPaymentForm({
        amount: "",
        paymentDate: "",
        paymentMethod: "CASH",
        checkNumber: "",
        amountMode: "$",
      });
      setIsRecordPayment(false);
    } catch (error) {
      toast.error("Failed to record payment");
    }
  };

  const handleRefund = async () => {
    try {
      const paymentId =
        typeof activeTransaction?.id === "string"
          ? activeTransaction.id
          : typeof activeTransaction?._id === "string"
            ? activeTransaction._id
            : "";

      if (!paymentId) {
        toast.error("Missing payment id for refund");
        return;
      }

      await refundPayment({
        paymentId,
        payload: {
          amount: Number(refundAmount || 0),
          reason: refund.reason,
        },
      }).unwrap();

      toast.success("Refund issued successfully");
      setRefundAmount("");
      setrefund({ amount: 0, reason: "" });
      setActiveActionModal(null);
    } catch (error) {
      toast.error("Failed to issue refund");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 sm:p-4 "
      onClick={handleClose}
    >
      <div
        className="w-full max-w-[560px] max-h-[80vh] overflow-y-auto  rounded-2xl bg-white p-5 shadow-xl sm:max-w-[640px] sm:p-6 "
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-[22px] font-medium tracking-tight text-gray-900">
            Payments
          </h2>
          <button
            type="button"
            className="rounded-xl bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-primary/90  "
            onClick={() => {
              setIsRecordPayment(true);
              setIsReminderOpen(false);
            }}
          >
            Record Payment
          </button>
        </div>

        <div className="rounded-[2px] bg-[#f8f8f8] p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between text-sm font-medium text-gray-900 sm:text-base">
            <span>PAID</span>
            <span className="text-gray-600">
              DUE {formatCurrency(summary?.totalDue || 0)}
            </span>
          </div>

          <div className="h-11 overflow-hidden rounded-sm bg-[#9f9f9f] flex items-center">
            <input
              type="text"
              value={
                summary?.totalDue ? formatCurrency(summary.totalDue) : value
              }
              onChange={(e) => setValue(e.target.value)}
              className="w-full h-full bg-[#8f8f8f] px-4 text-sm font-medium text-white outline-none"
            />
          </div>

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-3 text-base font-medium text-[#f36f21] transition-colors hover:text-[#d95e12]"
            onClick={() => {
              setIsReminderOpen(true);
              setIsRecordPayment(false);
            }}
          >
            <span>Send Payment Reminder</span>
            <span className="text-[20px] leading-none">→</span>
          </button>
        </div>

        {/* {transactions.length > 0 && (
          <div className="flex justify-between mt-4">
            <div className="text-base font-normal">
              <p>
                {transactions[0] ? formatCurrency(transactions[0].amount) : "-"}
              </p>
              <p>
                {transactions[0]
                  ? `${formatDate(transactions[0].date)} / ${transactions[0].method}`
                  : "-"}
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setActiveTransaction(transactions[0]);
                  setActiveMenuId((prev) =>
                    prev === transactions[0].id ? null : transactions[0].id,
                  );
                }}
                className="rounded-lg bg-gray-300 p-1"
                aria-label="Open summary actions"
              >
                <LucideMoreHorizontal size={25} />
              </button>

              {activeMenuId === transactions[0].id && activeTransaction && (
                <div className="absolute right-0 top-11 z-50 w-36 rounded-lg border border-gray-200 bg-white shadow-lg">
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

                  {activeTransaction.type === "payment" && (
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
                  )}
                </div>
              )}
            </div>
          </div>
        )} */}

        {showPaymentList && (
          <div className="mt-5 space-y-0">
            {transactions.map((transaction: any) => {
              const isRefund = transaction.type === "refund";
              const isActive = activeMenuId === transaction.id;

              return (
                <div
                  key={transaction.id}
                  className="border-b border-gray-200 py-4 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p
                        className={`text-base font-semibold ${isRefund ? "text-gray-400" : "text-gray-900"}`}
                      >
                        {formatCurrency(transaction.amount)}
                        {isRefund ? " (Refund)" : ""}
                      </p>
                      <p
                        className={`mt-1 text-sm ${isRefund ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {formatDate(transaction.date)} / {transaction.method}
                      </p>
                    </div>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTransaction(transaction);
                          setActiveMenuId((prev) =>
                            prev === transaction.id ? null : transaction.id,
                          );
                        }}
                        className="flex h-10 w-10 items-center justify-center rounded-[6px] bg-[#eff0f3] text-gray-600 transition-colors hover:bg-gray-200"
                        aria-label={`${transaction.type} actions`}
                      >
                        <LucideMoreHorizontal size={20} />
                      </button>

                      {isActive && (
                        <div className="absolute right-0 top-11 z-50 w-32 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
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
                          {isRefund ? null : (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTransaction(transaction);
                                setRefundAmount(
                                  String(transaction.amount || ""),
                                );
                                setRefundAmount(
                                  String(transaction.amount || ""),
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
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="rounded-[14px] bg-[#e97f2d] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#d96f1f]"
            onClick={handleClose}
          >
            Close
          </button>
        </div>
      </div>

      {isReminderOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            event.stopPropagation();
            setIsReminderOpen(false);
          }}
        >
          <div
            className="w-full max-w-[640px] rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-gray-900">
              Send Payment Reminder
            </h2>

            <div className="mt-8 space-y-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  To
                </label>

                <div className="flex min-h-[48px] w-full flex-wrap items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-primary">
                  {showClientEmail && clientEmail ? (
                    <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700">
                      <span>{clientEmail}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowClientEmail(false);
                          setFormData((prev) => ({
                            ...prev,
                            to: prev.to.filter(
                              (email) => email !== clientEmail,
                            ),
                          }));
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Remove client email"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}

                  {formData.to.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            to: prev.to.filter((item) => item !== email),
                          }));
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remove ${email}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <input
                    type="text"
                    placeholder="Add email..."
                    value={emailInput}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      setEmailInput(event.target.value);
                    }}
                    onKeyDown={(
                      event: React.KeyboardEvent<HTMLInputElement>,
                    ) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addRecipientEmail(emailInput);
                      }
                    }}
                    className="flex-1 bg-transparent text-sm outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-900">
                  Subject
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      subject: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm text-gray-500 outline-none placeholder:text-gray-400 focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      sendMeCopy: !prev.sendMeCopy,
                    }))
                  }
                  className={`relative inline-flex h-8 w-16 items-center rounded-full px-1 transition-colors ${
                    formData.sendMeCopy ? "bg-primary" : "bg-gray-200"
                  }`}
                  aria-label="Send me a copy toggle"
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow transition-transform ${
                      formData.sendMeCopy ? "translate-x-8" : "translate-x-0"
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
                  value={formData.message}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      message: event.target.value,
                    }))
                  }
                  className="min-h-[120px] w-full rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 text-gray-600 outline-none focus:border-primary"
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
                onClick={handleInvoiceReminder}
                type="button"
                className="min-w-[112px] rounded-xl bg-primary px-6 py-3 text-base text-white transition-colors hover:opacity-90"
              >
                Send
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
