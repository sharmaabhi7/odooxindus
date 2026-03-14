-- AlterTable
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "contact_info" TEXT;
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "storage_capacity" INTEGER;
ALTER TABLE "warehouses" ADD COLUMN IF NOT EXISTS "operational_hours" TEXT;

UPDATE "warehouses"
SET
  "address" = COALESCE("address", ''),
  "contact_info" = COALESCE("contact_info", ''),
  "storage_capacity" = COALESCE("storage_capacity", 0),
  "operational_hours" = COALESCE("operational_hours", '')
WHERE
  "address" IS NULL
  OR "contact_info" IS NULL
  OR "storage_capacity" IS NULL
  OR "operational_hours" IS NULL;

ALTER TABLE "warehouses" ALTER COLUMN "address" SET NOT NULL;
ALTER TABLE "warehouses" ALTER COLUMN "contact_info" SET NOT NULL;
ALTER TABLE "warehouses" ALTER COLUMN "storage_capacity" SET NOT NULL;
ALTER TABLE "warehouses" ALTER COLUMN "storage_capacity" SET DEFAULT 0;
ALTER TABLE "warehouses" ALTER COLUMN "operational_hours" SET NOT NULL;
