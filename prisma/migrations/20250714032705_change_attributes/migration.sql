/*
  Warnings:

  - You are about to drop the column `goal_per_game` on the `player` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `player` table. All the data in the column will be lost.
  - Added the required column `attack` to the `player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defense` to the `player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intelligence` to the `player` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mentality` to the `player` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "player" DROP COLUMN "goal_per_game",
DROP COLUMN "rating",
ADD COLUMN     "attack" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "defense" INTEGER NOT NULL,
ADD COLUMN     "goals_conceded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goals_scored" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "intelligence" INTEGER NOT NULL,
ADD COLUMN     "mentality" INTEGER NOT NULL;
