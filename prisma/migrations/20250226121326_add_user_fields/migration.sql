-- AlterTable
ALTER TABLE "User" ADD COLUMN     "CurrentBadge" TEXT NOT NULL DEFAULT 'Beginner',
ADD COLUMN     "JoinDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "Journey" TEXT[];
