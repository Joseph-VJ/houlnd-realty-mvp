import { prisma } from "@/lib/db";
import { requireAuth, unauthorizedResponse, forbiddenResponse } from "@/lib/apiAuth";

function parseNumber(value: string | null) {
  if (value === null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
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
  try {
    const user = await requireAuth(req);

    if (user.role !== "PROMOTER") {
      return forbiddenResponse("Only PROMOTER can create listings");
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
        promoterId: user.userId,
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
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Unauthorized')) {
        return unauthorizedResponse(error.message);
      }
      if (error.message.includes('Forbidden')) {
        return forbiddenResponse(error.message);
      }
    }
    console.error('Error creating listing:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
