/*
  Warnings:

  - A unique constraint covering the columns `[winner_id]` on the table `championship` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[duo_winner_id]` on the table `championship` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[championship_winner_id]` on the table `duo` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[championship_winner_id]` on the table `player` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "championship" ADD COLUMN     "duo_winner_id" TEXT,
ADD COLUMN     "winner_id" TEXT;

-- AlterTable
ALTER TABLE "duo" ADD COLUMN     "championship_winner_id" TEXT;

-- AlterTable
ALTER TABLE "player" ADD COLUMN     "championship_winner_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "championship_winner_id_key" ON "championship"("winner_id");

-- CreateIndex
CREATE UNIQUE INDEX "championship_duo_winner_id_key" ON "championship"("duo_winner_id");

-- CreateIndex
CREATE UNIQUE INDEX "duo_championship_winner_id_key" ON "duo"("championship_winner_id");

-- CreateIndex
CREATE UNIQUE INDEX "player_championship_winner_id_key" ON "player"("championship_winner_id");

-- AddForeignKey
ALTER TABLE "championship" ADD CONSTRAINT "championship_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "championship" ADD CONSTRAINT "championship_duo_winner_id_fkey" FOREIGN KEY ("duo_winner_id") REFERENCES "duo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
