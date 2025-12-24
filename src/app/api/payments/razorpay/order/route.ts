import Razorpay from "razorpay";

import { prisma } from "@/lib/db";
import { getUnlockFeeInr, isRazorpayEnabled } from "@/lib/env";

async function requireUserId(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return { error: Response.json({ error: "Missing x-user-id" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });
  if (!user) {
    return { error: Response.json({ error: "Invalid user" }, { status: 401 }) };
  }
  return { user };
}

export async function POST(req: Request) {
  if (!isRazorpayEnabled()) {
    return Response.json(
      { error: "Razorpay not configured" },
      { status: 400 },
    );
  }

  const auth = await requireUserId(req);
  if ("error" in auth) return auth.error;

  const body = (await req.json().catch(() => null)) as
    | { listingId?: string }
    | null;

  if (!body?.listingId) {
    return Response.json({ error: "listingId is required" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: body.listingId },
    select: { id: true, status: true },
  });

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  if (listing.status !== "LIVE") {
    return Response.json(
      { error: "Listing must be LIVE to unlock" },
      { status: 400 },
    );
  }

  // If already unlocked, no need to create an order.
  const existingUnlock = await prisma.unlock.findUnique({
    where: { userId_listingId: { userId: auth.user.id, listingId: listing.id } },
    select: { id: true },
  });
  if (existingUnlock) {
    return Response.json({ alreadyUnlocked: true });
  }

  const amountInr = getUnlockFeeInr();
  const amountPaise = amountInr * 100;

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt: `unlock_${listing.id}_${auth.user.id}_${Date.now()}`,
    notes: {
      listingId: listing.id,
      userId: auth.user.id,
      purpose: "CONTACT_UNLOCK",
    },
  });

  await prisma.paymentOrder.create({
    data: {
      provider: "RAZORPAY",
      status: "CREATED",
      userId: auth.user.id,
      listingId: listing.id,
      amountPaise,
      currency: "INR",
      providerOrderId: order.id,
    },
    select: { id: true },
  });

  return Response.json({
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order.id,
    amountPaise,
    currency: "INR",
    listingId: listing.id,
  });
}
