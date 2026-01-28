-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('EMAIL', 'PHONE');

-- AlterTable
ALTER TABLE "Preferences" ADD COLUMN     "preferredVerfication" "VerificationType";

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationCode_userId_key" ON "VerificationCode"("userId");

-- AddForeignKey
ALTER TABLE "VerificationCode" ADD CONSTRAINT "VerificationCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
