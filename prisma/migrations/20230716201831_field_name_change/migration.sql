/*
  Warnings:

  - You are about to drop the column `linkedIdTest` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "linkedIdTest",
ADD COLUMN     "linkedId" INTEGER;
