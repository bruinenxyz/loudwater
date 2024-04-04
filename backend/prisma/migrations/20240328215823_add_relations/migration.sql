-- CreateEnum
CREATE TYPE "RelationType" AS ENUM ('one_to_one', 'one_to_many', 'many_to_many');

-- CreateTable
CREATE TABLE "relation" (
    "id" VARCHAR(32) NOT NULL DEFAULT CONCAT('rltn_', ksuid()),
    "organization_id" TEXT NOT NULL,
    "database_id" TEXT NOT NULL,
    "type" "RelationType" NOT NULL,
    "table_1" TEXT NOT NULL,
    "table_2" TEXT NOT NULL,
    "column_1" TEXT NOT NULL,
    "column_2" TEXT NOT NULL,
    "join_table" TEXT,
    "join_column_1" TEXT,
    "join_column_2" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "relation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "relation" ADD CONSTRAINT "relation_database_id_fkey" FOREIGN KEY ("database_id") REFERENCES "database"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
