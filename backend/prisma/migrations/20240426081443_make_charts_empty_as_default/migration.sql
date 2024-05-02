/*
  Warnings:

  - Made the column `charts` on table `query` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "query" ALTER COLUMN "charts" SET NOT NULL,
ALTER COLUMN "charts" SET DEFAULT '[]';
