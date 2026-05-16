-- CreateEnum
CREATE TYPE "SavedType" AS ENUM ('chord', 'scale', 'progression');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saved" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "savedType" "SavedType" NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT,
    "mode" TEXT,
    "notes" TEXT[],
    "chord" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "voicingIndex" INTEGER,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Saved_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Saved_userId_savedType_fingerprint_key" ON "Saved"("userId", "savedType", "fingerprint");

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
