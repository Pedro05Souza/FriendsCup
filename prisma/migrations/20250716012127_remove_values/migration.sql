/*
  Warnings:

  - You are about to drop the column `goals_conceded` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `goals_scored` on the `player` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "player" DROP COLUMN "goals_conceded",
DROP COLUMN "goals_scored";
