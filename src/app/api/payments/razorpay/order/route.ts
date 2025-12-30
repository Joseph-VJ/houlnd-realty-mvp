/**
 * API Route: Create Razorpay Order
 *
 * Creates a Razorpay order for contact unlock payment.
 *
 * SECURITY: Uses requireAuth for secure user identification.
 * Never trusts client-provided user IDs.
 */

import Razorpay from "razorpay";

import { prisma } from "@/lib/db";
import { getUnlockFeeInr, isRazorpayEnabled } from "@/lib/env";
import { requireAuth, unauthorizedResponse } from "@/lib/apiAuth";

/**
 * Require authenticated user securely
 * SECURITY FIX: Replaced insecure x-user-id header with cryptographic JWT verification
 */
async function requireUserId(req: Request) {
  try {
    const user = await requireAuth(req);
    return { user: { id: user.userId } };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return { error: unauthorizedResponse(error.message) };
    }
    return { error: unauthorizedResponse('Authentication required') };
  }
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
  // SECURITY: auth.user.id is now verified via JWT, not trusted from client header
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
