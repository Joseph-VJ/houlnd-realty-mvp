-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "phone_e164" TEXT,
    "full_name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "property_type" TEXT NOT NULL,
    "total_price" REAL NOT NULL,
    "total_sqft" REAL NOT NULL,
    "price_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promoter_id" TEXT NOT NULL,
    "amenities_json" TEXT,
    "amenities_price" REAL,
    "title" TEXT,
    "description" TEXT,
    "city" TEXT,
    "locality" TEXT,
    "address" TEXT,
    "state" TEXT,
    "pin_code" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "floor_number" INTEGER,
    "total_floors" INTEGER,
    "furnishing" TEXT,
    "possession_status" TEXT,
    "age_years" INTEGER,
    "facing" TEXT,
    "parking_count" INTEGER,
    "image_urls" TEXT NOT NULL DEFAULT '[]',
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "save_count" INTEGER NOT NULL DEFAULT 0,
    "unlock_count" INTEGER NOT NULL DEFAULT 0,
    "price_per_sqft" REAL NOT NULL DEFAULT 0,
    "reviewed_at" DATETIME,
    "reviewed_by" TEXT,
    "rejection_reason" TEXT,
    "deleted_at" DATETIME,
    CONSTRAINT "listings_promoter_id_fkey" FOREIGN KEY ("promoter_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "listing_agreement_acceptances" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accepted_at" DATETIME NOT NULL,
    "listing_id" TEXT NOT NULL,
    CONSTRAINT "listing_agreement_acceptances_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "unlocks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "payment_provider" TEXT,
    "payment_ref" TEXT,
    "unlocked_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "unlocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "unlocks_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "amount_paise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "provider_order_id" TEXT NOT NULL,
    "provider_payment_id" TEXT,
    "provider_signature" TEXT,
    "paid_at" DATETIME,
    "error_code" TEXT,
    "error_description" TEXT,
    CONSTRAINT "payment_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_orders_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "saved_properties" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "saved_price" REAL,
    CONSTRAINT "saved_properties_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "saved_properties_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "listing_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "promoter_id" TEXT NOT NULL,
    "scheduled_start" DATETIME NOT NULL,
    "scheduled_end" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "customer_notes" TEXT,
    "promoter_notes" TEXT,
    "cancelled_at" DATETIME,
    "cancelled_by" TEXT,
    "cancellation_reason" TEXT,
    CONSTRAINT "appointments_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "appointments_promoter_id_fkey" FOREIGN KEY ("promoter_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" DATETIME,
    "link_url" TEXT,
    "metadata" TEXT,
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "details" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "listing_agreement_acceptances_listing_id_key" ON "listing_agreement_acceptances"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "unlocks_user_id_listing_id_key" ON "unlocks"("user_id", "listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_orders_provider_order_id_key" ON "payment_orders"("provider_order_id");
