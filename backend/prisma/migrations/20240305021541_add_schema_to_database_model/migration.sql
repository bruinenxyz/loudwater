/*
  Warnings:

  - Added the required column `schema` to the `database` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "database" ADD COLUMN     "schema" TEXT NOT NULL;
