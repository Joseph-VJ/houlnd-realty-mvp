import { prisma } from "@/lib/db";

function parseNumber(value: string | null) {
  if (value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

async function requireUserId(req: Request) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return { error: Response.json({ error: "Missing x-user-id" }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user) {
    return { error: Response.json({ error: "Invalid user" }, { status: 401 }) };
  }
  return { user };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const minPpsf = parseNumber(url.searchParams.get("minPpsf"));
  const maxPpsf = parseNumber(url.searchParams.get("maxPpsf"));

  const listings = await prisma.listing.findMany({
    where: { status: "LIVE" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      propertyType: true,
      totalPrice: true,
      totalSqft: true,
      priceType: true,
      createdAt: true,
    },
  });

  const filtered = listings.filter((l: any) => {
    const ppsf = l.totalPrice / l.totalSqft;
    if (minPpsf !== null && ppsf < minPpsf) return false;
    if (maxPpsf !== null && ppsf > maxPpsf) return false;
    return true;
  });

  return Response.json({ listings: filtered });
}

export async function POST(req: Request) {
  const auth = await requireUserId(req);
  if ("error" in auth) return auth.error;

  if (auth.user.role !== "PROMOTER") {
    return Response.json({ error: "Only PROMOTER can create listings" }, { status: 403 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        propertyType?: "PLOT" | "APARTMENT";
        totalPrice?: number;
        totalSqft?: number;
        priceType?: "FIXED" | "NEGOTIABLE";
        amenities?: unknown;
        amenitiesPrice?: number;
        agreementAccepted?: boolean;
      }
    | null;

  if (!body) return Response.json({ error: "Invalid JSON" }, { status: 400 });

  const requiredMissing = [
    body.propertyType ? null : "propertyType",
    body.priceType ? null : "priceType",
    typeof body.totalPrice === "number" ? null : "totalPrice",
    typeof body.totalSqft === "number" ? null : "totalSqft",
  ].filter(Boolean);

  if (requiredMissing.length) {
    return Response.json(
      { error: `Missing fields: ${requiredMissing.join(", ")}` },
      { status: 400 },
    );
  }

  if (!body.agreementAccepted) {
    return Response.json(
      { error: "Commission agreement must be accepted" },
      { status: 400 },
    );
  }

  if (body.totalSqft! <= 0 || body.totalPrice! <= 0) {
    return Response.json(
      { error: "totalPrice and totalSqft must be > 0" },
      { status: 400 },
    );
  }

  const listing = await prisma.listing.create({
    data: {
      promoterId: auth.user.id,
      propertyType: body.propertyType!,
      totalPrice: Math.trunc(body.totalPrice!),
      totalSqft: Math.trunc(body.totalSqft!),
      priceType: body.priceType!,
      amenitiesJson:
        body.amenities === undefined ? null : (body.amenities as any),
      amenitiesPrice:
        typeof body.amenitiesPrice === "number"
          ? Math.trunc(body.amenitiesPrice)
          : null,
      agreementAcceptance: {
        create: {
          acceptedAt: new Date(),
        },
      },
    },
    select: { id: true, status: true, createdAt: true },
  });

  return Response.json({ listing });
}
