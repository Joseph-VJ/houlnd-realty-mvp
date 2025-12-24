// NOTE (MVP): Prisma v6 uses DATABASE_URL from .env + prisma/schema.prisma.
// This file is kept only because the tool-generated Prisma config is present in the repo.
// We keep it minimal and ensure it loads .env for local development.
import "dotenv/config";

const prismaConfig = {
  schema: "prisma/schema.prisma",
};

export default prismaConfig;
