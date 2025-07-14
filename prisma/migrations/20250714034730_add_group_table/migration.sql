-- CreateTable
CREATE TABLE "group_player" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "championship_group_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "goal_difference" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "group_player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "championship_group" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "championship_group_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "group_player" ADD CONSTRAINT "group_player_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_player" ADD CONSTRAINT "group_player_championship_group_id_fkey" FOREIGN KEY ("championship_group_id") REFERENCES "championship_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "championship_group" ADD CONSTRAINT "championship_group_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
