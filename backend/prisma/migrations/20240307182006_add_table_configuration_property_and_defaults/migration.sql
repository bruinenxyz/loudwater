-- AlterTable
ALTER TABLE "query" ALTER COLUMN "permissions" SET DEFAULT '{}';

-- AlterTable
ALTER TABLE "table" ADD COLUMN     "configuration" JSONB NOT NULL DEFAULT '{}',
ALTER COLUMN "permissions" SET DEFAULT '{}',
ALTER COLUMN "properties" SET DEFAULT '{}';
