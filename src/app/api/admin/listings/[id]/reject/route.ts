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

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(req);
  if ("error" in auth) return auth.error;

  const { id } = await ctx.params;

  const listing = await prisma.listing.update({
    where: { id },
    data: { status: "REJECTED" },
    select: { id: true, status: true },
  });

  return Response.json({ listing });
}
