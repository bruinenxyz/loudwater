-- CreateTable
CREATE TABLE "database" (
    "id" TEXT NOT NULL,

    CONSTRAINT "database_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table" (
    "id" TEXT NOT NULL,

    CONSTRAINT "table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query" (
    "id" TEXT NOT NULL,

    CONSTRAINT "query_pkey" PRIMARY KEY ("id")
);
