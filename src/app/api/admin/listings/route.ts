import { prisma } from "@/lib/db";

async function requireAdmin(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return { error: Response.json({ error: "Missing x-user-id" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") {
    return { error: Response.json({ error: "Admin only" }, { status: 403 }) };
  }
  return { user };
}

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

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
}
