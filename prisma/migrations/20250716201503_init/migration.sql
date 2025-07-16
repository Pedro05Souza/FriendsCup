-- CreateTable
CREATE TABLE "player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intelligence" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "attack" INTEGER NOT NULL,
    "mentality" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "championship" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "is_duo" BOOLEAN NOT NULL,
    "winner_id" TEXT,
    "duo_winner_id" TEXT,

    CONSTRAINT "championship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "match_phase" TEXT NOT NULL,
    "winner_id" TEXT,
    "duo_winner_id" TEXT,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participant" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "player_id" TEXT,
    "duo_id" TEXT,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "penalty_shootout_goals" INTEGER DEFAULT 0,

    CONSTRAINT "match_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_player" (
    "id" TEXT NOT NULL,
    "player_id" TEXT,
    "duo_id" TEXT,
    "championship_group_id" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
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

-- CreateTable
CREATE TABLE "duo" (
    "id" TEXT NOT NULL,
    "player_1_id" TEXT NOT NULL,
    "player_2_id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "duo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChampionshipToPlayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChampionshipToPlayer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "duo_player_1_id_player_2_id_championship_id_key" ON "duo"("player_1_id", "player_2_id", "championship_id");

-- CreateIndex
CREATE INDEX "_ChampionshipToPlayer_B_index" ON "_ChampionshipToPlayer"("B");

-- AddForeignKey
ALTER TABLE "championship" ADD CONSTRAINT "championship_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "championship" ADD CONSTRAINT "championship_duo_winner_id_fkey" FOREIGN KEY ("duo_winner_id") REFERENCES "duo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_duo_winner_id_fkey" FOREIGN KEY ("duo_winner_id") REFERENCES "duo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participant" ADD CONSTRAINT "match_participant_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participant" ADD CONSTRAINT "match_participant_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participant" ADD CONSTRAINT "match_participant_duo_id_fkey" FOREIGN KEY ("duo_id") REFERENCES "duo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_player" ADD CONSTRAINT "group_player_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_player" ADD CONSTRAINT "group_player_duo_id_fkey" FOREIGN KEY ("duo_id") REFERENCES "duo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_player" ADD CONSTRAINT "group_player_championship_group_id_fkey" FOREIGN KEY ("championship_group_id") REFERENCES "championship_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "championship_group" ADD CONSTRAINT "championship_group_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo" ADD CONSTRAINT "duo_player_1_id_fkey" FOREIGN KEY ("player_1_id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo" ADD CONSTRAINT "duo_player_2_id_fkey" FOREIGN KEY ("player_2_id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "duo" ADD CONSTRAINT "duo_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChampionshipToPlayer" ADD CONSTRAINT "_ChampionshipToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "championship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChampionshipToPlayer" ADD CONSTRAINT "_ChampionshipToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
