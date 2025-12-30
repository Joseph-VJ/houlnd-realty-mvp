/**
 * API Route: Verify Razorpay Payment
 *
 * Verifies Razorpay payment signature and creates unlock record.
 *
 * SECURITY: Uses requireAuth for secure user identification.
 * Never trusts client-provided user IDs.
 */

import crypto from "crypto";

import { prisma } from "@/lib/db";
import { isRazorpayEnabled } from "@/lib/env";
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

function verifySignature(orderId: string, paymentId: string, signature: string) {
  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return expected === signature;
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
    | {
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        razorpay_signature?: string;
        listingId?: string;
      }
    | null;

  if (
    !body?.razorpay_order_id ||
    !body.razorpay_payment_id ||
    !body.razorpay_signature ||
    !body.listingId
  ) {
    return Response.json(
      { error: "Missing Razorpay verification fields" },
      { status: 400 },
    );
  }

  const paymentOrder = await prisma.paymentOrder.findUnique({
    where: { providerOrderId: body.razorpay_order_id },
    select: {
      id: true,
      status: true,
      userId: true,
      listingId: true,
      providerOrderId: true,
    },
  });

  if (!paymentOrder) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  // SECURITY: auth.user.id is now verified via JWT, not trusted from client header
  if (paymentOrder.userId !== auth.user.id || paymentOrder.listingId !== body.listingId) {
    return Response.json({ error: "Order mismatch" }, { status: 403 });
  }

  const ok = verifySignature(
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature,
  );

  if (!ok) {
    await prisma.paymentOrder.update({
      where: { id: paymentOrder.id },
      data: {
        status: "FAILED",
        providerPaymentId: body.razorpay_payment_id,
        providerSignature: body.razorpay_signature,
      },
      select: { id: true },
    });

    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  await prisma.paymentOrder.update({
    where: { id: paymentOrder.id },
    data: {
      status: "PAID",
      providerPaymentId: body.razorpay_payment_id,
      providerSignature: body.razorpay_signature,
      paidAt: new Date(),
    },
    select: { id: true },
  });

  // Create the unlock record (idempotent).
  await prisma.unlock.upsert({
    where: {
      userId_listingId: { userId: auth.user.id, listingId: paymentOrder.listingId },
    },
    create: {
      userId: auth.user.id,
      listingId: paymentOrder.listingId,
      paymentProvider: "RAZORPAY",
      paymentRef: body.razorpay_payment_id,
    },
    update: {
      paymentProvider: "RAZORPAY",
      paymentRef: body.razorpay_payment_id,
    },
    select: { id: true },
  });

  // Increment unlock count for analytics
  await prisma.listing.update({
    where: { id: paymentOrder.listingId },
    data: { unlockCount: { increment: 1 } },
  });

  return Response.json({ ok: true });
}
