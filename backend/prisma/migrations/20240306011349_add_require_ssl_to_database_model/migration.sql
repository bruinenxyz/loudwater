/*
  Warnings:

  - Added the required column `require_ssl` to the `database` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "database" ADD COLUMN     "require_ssl" BOOLEAN NOT NULL;
