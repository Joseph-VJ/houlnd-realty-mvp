import { prisma } from "@/lib/db";
import { maskPhoneE164 } from "@/lib/mask";

async function getRequester(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
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
