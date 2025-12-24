import { prisma } from "@/lib/db";

function isDev() {
  return process.env.NODE_ENV !== "production";
}

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

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isDev()) {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  const auth = await requireUserId(req);
  if ("error" in auth) return auth.error;

  const { id: listingId } = await ctx.params;

  // DEV-only shortcut: create unlock record without payment gateway.
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

  return Response.json({ unlock });
}
