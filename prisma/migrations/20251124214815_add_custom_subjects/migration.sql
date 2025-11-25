-- AlterTable
ALTER TABLE "User" ADD COLUMN     "customSubjects" TEXT[] DEFAULT ARRAY[]::TEXT[];
