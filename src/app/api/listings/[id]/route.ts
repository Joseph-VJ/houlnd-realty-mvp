/**
 * API Route: Get Listing by ID
 *
 * Returns listing details with contact information.
 * Contact phone is masked unless the requester has unlocked it.
 *
 * SECURITY: Uses optionalAuth for secure user identification.
 * Never trusts client-provided user IDs.
 */

import { prisma } from "@/lib/db";
import { maskPhoneE164 } from "@/lib/mask";
import { optionalAuth } from "@/lib/apiAuth";

/**
 * Get authenticated user securely (optional - returns null if not authenticated)
 * SECURITY FIX: Replaced insecure x-user-id header with cryptographic JWT verification
 */
async function getRequester(req: Request) {
  try {
    const user = await optionalAuth(req);
    return user ? { id: user.userId } : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const requester = await getRequester(req);

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      propertyType: true,
      totalPrice: true,
      totalSqft: true,
      priceType: true,
      amenitiesJson: true,
      amenitiesPrice: true,
      createdAt: true,
      promoter: { select: { id: true, phoneE164: true } },
    },
  });

  if (!listing) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  // Privacy rule: unmasked phone is returned ONLY if requester has an unlock for this listing.
  // SECURITY: requester.id is now verified via JWT, not trusted from client header
  const unlock = requester
    ? await prisma.unlock.findUnique({
        where: { userId_listingId: { userId: requester.id, listingId: id } },
        select: { id: true },
      })
    : null;

  const maskedPhone = maskPhoneE164(listing.promoter.phoneE164);

  const contact = unlock
    ? { unlocked: true, maskedPhone, phoneE164: listing.promoter.phoneE164 }
    : { unlocked: false, maskedPhone };

  return Response.json({
    listing: {
      id: listing.id,
      status: listing.status,
      propertyType: listing.propertyType,
      totalPrice: listing.totalPrice,
      totalSqft: listing.totalSqft,
      priceType: listing.priceType,
      amenities: listing.amenitiesJson ? JSON.parse(listing.amenitiesJson) : null,
      amenitiesPrice: listing.amenitiesPrice,
      createdAt: listing.createdAt,
      promoterId: listing.promoter.id,
    },
    contact,
  });
}
