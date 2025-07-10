-- CreateEnum
CREATE TYPE "ExportRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateTable
CREATE TABLE "shopkeepers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "shop_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopkeepers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "expiry_date" TIMESTAMP(3),
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "shopkeeper_id" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_requests" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "ExportRequestStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "product_id" TEXT NOT NULL,
    "from_shop_id" TEXT NOT NULL,
    "to_shop_id" TEXT NOT NULL,

    CONSTRAINT "export_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shopkeepers_email_key" ON "shopkeepers"("email");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_shopkeeper_id_fkey" FOREIGN KEY ("shopkeeper_id") REFERENCES "shopkeepers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_requests" ADD CONSTRAINT "export_requests_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_requests" ADD CONSTRAINT "export_requests_from_shop_id_fkey" FOREIGN KEY ("from_shop_id") REFERENCES "shopkeepers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_requests" ADD CONSTRAINT "export_requests_to_shop_id_fkey" FOREIGN KEY ("to_shop_id") REFERENCES "shopkeepers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
