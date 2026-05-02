"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { usePaymentMutation } from "@/redux/api/admin/invoiceApi";
import { useParams } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutForm({
  invoiceId,
  onClose,
}: {
  invoiceId: string;
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  const [payment] = usePaymentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setSubmitting(true);

    try {
      // Submit elements first to validate
      const { error: submitError } = await elements.submit();

      if (submitError) {
        toast.error(submitError.message || "Form submission failed");
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/invoice/${invoiceId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        return;
      }

      if (paymentIntent) {
        const paymentMethodId =
          typeof paymentIntent.payment_method === "string"
            ? paymentIntent.payment_method
            : paymentIntent.payment_method?.id;

        if (paymentMethodId) {
          const paymentResponse = await payment({
            invoiceId,
            payload: {
              paymentMethodId,
            },
          }).unwrap();

          if (paymentResponse?.success) {
            toast.success("Payment successful");
            onClose();
          } else {
            toast.error(paymentResponse?.message || "Payment failed");
          }
        } else {
          toast.success("Payment successful");
          onClose();
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Payment error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-white rounded">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "Processing…" : "Pay Now"}
      </button>
    </form>
  );
}

export default function StripeCheckoutModal({
  invoiceId,
  onClose,
}: {
  invoiceId?: string;
  onClose: () => void;
}) {
  const params = useParams();
  const resolvedInvoiceId = invoiceId || (params?.id as string);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!resolvedInvoiceId) {
      toast.error("Invoice id missing");
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    async function createPaymentIntent() {
      try {
        const res = await fetch(`/api/invoice/pay-with-stripe/${resolvedInvoiceId}`, {
          method: "POST",
        });

        const paymentResponse = await res.json();
        const clientSecret = paymentResponse?.clientSecret || paymentResponse?.result?.clientSecret;

        if (clientSecret) {
          if (mounted) setClientSecret(clientSecret);
        } else {
          toast.error(paymentResponse?.error || "Failed to create payment intent");
        }
      } catch (err: any) {
        toast.error(err?.message || "Payment intent error");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    createPaymentIntent();

    return () => {
      mounted = false;
    };
  }, [resolvedInvoiceId]);

  if (!clientSecret) return null;

  return (
    <div className="mt-6 relative">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Payment Method</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <Elements
          stripe={stripePromise}
           options={{
    clientSecret,
    appearance: { theme: "stripe" },
  }}
        >
          <CheckoutForm invoiceId={resolvedInvoiceId!} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
}