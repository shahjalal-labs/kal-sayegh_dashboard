"use client";

import { usePaymentIntentMutation } from "@/redux/api/admin/invoiceApi";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

const paymentIntentRequestCache = new Map<
  string,
  Promise<string | null>
>();

/* ---------------- CHECKOUT FORM ---------------- */

function CheckoutForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || loading) return;

    setLoading(true);

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        toast.error(submitError.message || "Validation failed");
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast.error(error.message || "Payment failed");
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        toast.success("Payment successful 🎉");
        onClose();
      }
    } catch (err: any) {
      toast.error(err?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-lg bg-white p-4 border">
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-primary text-white py-3 rounded-lg"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

/* ---------------- MAIN MODAL ---------------- */

export default function StripeCheckoutModal({
  invoiceId,
  onClose,
}: {
  invoiceId: string;
  onClose: () => void;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const requestVersionRef = useRef(0);

  const [createIntent] = usePaymentIntentMutation();

  useEffect(() => {
    if (!invoiceId) {
      setLoading(false);
      toast.error("Invoice id missing");
      return;
    }

    setLoading(true);
    setClientSecret(null);
    const currentRequestVersion = ++requestVersionRef.current;

    const init = async () => {
      try {
        let secretPromise = paymentIntentRequestCache.get(invoiceId);

        if (!secretPromise) {
          secretPromise = createIntent({ invoiceId })
            .unwrap()
            .then((res) => {
              return (
                res?.result?.clientSecret ||
                res?.result?.client_secret ||
                res?.clientSecret ||
                res?.client_secret ||
                null
              );
            })
            .catch((err: any) => {
              paymentIntentRequestCache.delete(invoiceId);
              throw err;
            });

          paymentIntentRequestCache.set(invoiceId, secretPromise);
        }

        const secret = await secretPromise;

        if (currentRequestVersion !== requestVersionRef.current) {
          return;
        }

        if (!secret) {
          toast.error("Client secret missing");
          paymentIntentRequestCache.delete(invoiceId);
          return;
        }

        setClientSecret(secret);
      } catch (err: any) {
        if (currentRequestVersion !== requestVersionRef.current) {
          return;
        }
        toast.error(
          err?.data?.message || err?.message || "Intent creation failed",
        );
      } finally {
        if (currentRequestVersion === requestVersionRef.current) {
          setLoading(false);
        }
      }
    };

    init();
  }, [invoiceId, createIntent]);

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">
        Creating payment intent...
      </div>
    );
  }

  // ❗ CRITICAL FIX: prevent Elements mount before clientSecret
  if (!clientSecret) {
    return (
      <div className="py-10 text-center text-red-500">
        Payment initialization failed
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="bg-[#F8F9F5] shadow-lg p-8 rounded-b-2xl">
        <h3 className="text-lg font-semibold mb-6 text-gray-600">
          Payment Method
        </h3>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: { theme: "stripe" },
          }}
        >
          <CheckoutForm onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
}
