/*
  Warnings:

  - The primary key for the `database` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `database` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `query` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `query` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - The primary key for the `table` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `table` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(32)`.
  - Added the required column `connection_url` to the `database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryption_vector` to the `database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_name` to the `database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `database` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator_id` to the `query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permissions` to the `query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `query` table without a default value. This is not possible if the table is not empty.
  - Added the required column `color` to the `table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `database_id` to the `table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `external_name` to the `table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `permissions` to the `table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `properties` to the `table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `table` table without a default value. This is not possible if the table is not empty.
  - Added the required column `visibility` to the `table` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VisibilityType" AS ENUM ('normal', 'hidden');

-- CreateEnum
CREATE TYPE "QueryType" AS ENUM ('sql', 'pipeline');

-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('organization', 'private');

-- AlterTable
ALTER TABLE "database" DROP CONSTRAINT "database_pkey",
ADD COLUMN     "connection_url" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "encryption_vector" TEXT NOT NULL,
ADD COLUMN     "external_name" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT CONCAT('dbse_', ksuid()),
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "database_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "query" DROP CONSTRAINT "query_pkey",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creator_id" TEXT NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "favorited_by" TEXT[],
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "permissions" JSONB NOT NULL,
ADD COLUMN     "pipeline" JSONB,
ADD COLUMN     "scope" "ScopeType" NOT NULL DEFAULT 'private',
ADD COLUMN     "sql" TEXT,
ADD COLUMN     "type" "QueryType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" SET DEFAULT CONCAT('quer_', ksuid()),
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "query_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "table" DROP CONSTRAINT "table_pkey",
ADD COLUMN     "color" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "database_id" TEXT NOT NULL,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "external_name" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "permissions" JSONB NOT NULL,
ADD COLUMN     "properties" JSONB NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visibility" "VisibilityType" NOT NULL,
ALTER COLUMN "id" SET DEFAULT CONCAT('tble_', ksuid()),
ALTER COLUMN "id" SET DATA TYPE VARCHAR(32),
ADD CONSTRAINT "table_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "table" ADD CONSTRAINT "table_database_id_fkey" FOREIGN KEY ("database_id") REFERENCES "database"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
