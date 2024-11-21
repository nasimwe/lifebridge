/*
  Warnings:

  - Added the required column `userId` to the `Sponsor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Sponsor" ADD COLUMN     "userId" INTEGER NOT NULL;
