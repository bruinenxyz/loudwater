/*
  Warnings:

  - Added the required column `database_id` to the `query` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "query" ADD COLUMN     "database_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "query" ADD CONSTRAINT "query_database_id_fkey" FOREIGN KEY ("database_id") REFERENCES "database"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
