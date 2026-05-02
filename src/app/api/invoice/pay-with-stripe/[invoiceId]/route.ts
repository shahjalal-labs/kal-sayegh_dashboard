import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SK || "";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
});

export async function POST(
  req: NextRequest,
  { params }: { params: { invoiceId: string } }
) {
  try {
    const { invoiceId } = params;

    if (!invoiceId) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Stripe secret key is not configured" },
        { status: 500 }
      );
    }

    // TODO: Replace with actual invoice lookup from database
    // For now, using a placeholder amount - update to fetch from db.json or your database
    const amount = 160000; // $1600 in cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        invoiceId,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
