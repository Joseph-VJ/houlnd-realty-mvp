/**
 * API Route: Unlock Listing Contact
 *
 * Creates an unlock record for a listing, allowing the user to view contact details.
 * Currently DEV-only shortcut (free unlock for testing).
 *
 * SECURITY: Uses requireAuth for secure user identification.
 * Never trusts client-provided user IDs.
 */

import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse } from "@/lib/apiAuth";

function isDev() {
  return process.env.NODE_ENV !== "production";
}

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

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isDev()) {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  const auth = await requireUserId(req);
  if ("error" in auth) return auth.error;

  const { id: listingId } = await ctx.params;

  // Verify listing exists
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true },
  });

  if (!listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  // DEV-only shortcut: create unlock record without payment gateway.
  // SECURITY: auth.user.id is now verified via JWT, not trusted from client header
  const unlock = await prisma.unlock.upsert({
    where: { userId_listingId: { userId: auth.user.id, listingId } },
    create: {
      userId: auth.user.id,
      listingId,
      paymentProvider: "DEV",
      paymentRef: `dev_${Date.now()}`,
    },
    update: {},
    select: { id: true, userId: true, listingId: true },
  });

  // Increment unlock count for analytics
  await prisma.listing.update({
    where: { id: listingId },
    data: { unlockCount: { increment: 1 } },
  });

  return Response.json({ unlock });
}
