/*
  Warnings:

  - You are about to drop the column `penaltyScore` on the `match_score` table. All the data in the column will be lost.
  - You are about to drop the column `GoalPerGame` on the `player` table. All the data in the column will be lost.
  - Added the required column `goal_per_game` to the `player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "championship" ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "match_score" DROP COLUMN "penaltyScore",
ADD COLUMN     "penalty_score" INTEGER;

-- AlterTable
ALTER TABLE "player" DROP COLUMN "GoalPerGame",
ADD COLUMN     "goal_per_game" DOUBLE PRECISION NOT NULL;
