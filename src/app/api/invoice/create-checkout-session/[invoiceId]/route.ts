import Stripe from "stripe";
import { NextResponse } from "next/server";

function getStripeInstance() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set in environment");
  return new Stripe(key, { apiVersion: "2023-08-16" });
}

// TODO: replace with real DB lookup for invoice and amount
async function getInvoiceById(id: string) {
  return { id, totalAmount: 1600.0, invoiceName: `Invoice-${id}` };
}

export async function POST(req: Request, { params }: { params: { invoiceId: string } }) {
  const { invoiceId } = params;

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const amount = Math.round((invoice.totalAmount || 0) * 100);

  try {
    const stripe = getStripeInstance();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: invoice.invoiceName || `Invoice ${invoiceId}` },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: { invoiceId },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/invoice/${invoiceId}?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/invoice/${invoiceId}?status=cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Stripe error" }, { status: 500 });
  }
}
