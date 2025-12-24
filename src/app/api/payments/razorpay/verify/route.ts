import crypto from "crypto";

import { prisma } from "@/lib/db";
import { isRazorpayEnabled } from "@/lib/env";

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

  return Response.json({ ok: true });
}
