/*
  Warnings:

  - You are about to drop the column `roomId` on the `ActiveSession` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ActiveSession" DROP CONSTRAINT "ActiveSession_roomId_fkey";

-- DropIndex
DROP INDEX "public"."ActiveSession_userId_roomId_key";

-- AlterTable
ALTER TABLE "ActiveSession" DROP COLUMN "roomId";
