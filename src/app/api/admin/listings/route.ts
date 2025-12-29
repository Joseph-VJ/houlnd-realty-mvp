import { prisma } from "@/lib/db";
import { requireRole, unauthorizedResponse, forbiddenResponse } from "@/lib/apiAuth";

export async function GET(req: Request) {
  try {
    const user = await requireRole(req, "ADMIN");

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as
    | "PENDING_VERIFICATION"
    | "LIVE"
    | "REJECTED"
    | null;

  const listings = await prisma.listing.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      propertyType: true,
      totalPrice: true,
      totalSqft: true,
      priceType: true,
      createdAt: true,
      promoter: {
        select: { id: true, phoneE164: true },
      },
      },
    });

    return Response.json({ listings });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return unauthorizedResponse(error.message);
      }
      if (error.message.includes('Forbidden')) {
        return forbiddenResponse(error.message);
      }
    }
    console.error('Error fetching admin listings:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
