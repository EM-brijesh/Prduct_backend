/*
  Warnings:

  - Added the required column `pdfurl` to the `Diet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfurl` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Diet" ADD COLUMN     "pdfurl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "pdfurl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refcode" TEXT;
