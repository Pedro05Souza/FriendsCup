-- CreateTable
CREATE TABLE "player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "GoalPerGame" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_score" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "penaltyScore" INTEGER,

    CONSTRAINT "match_score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "championship" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "championship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" TEXT NOT NULL,
    "championship_id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "match_phase" TEXT NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChampionshipToPlayer" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChampionshipToPlayer_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_score_match_id_key" ON "match_score"("match_id");

-- CreateIndex
CREATE INDEX "_ChampionshipToPlayer_B_index" ON "_ChampionshipToPlayer"("B");

-- AddForeignKey
ALTER TABLE "match_score" ADD CONSTRAINT "match_score_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChampionshipToPlayer" ADD CONSTRAINT "_ChampionshipToPlayer_A_fkey" FOREIGN KEY ("A") REFERENCES "championship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChampionshipToPlayer" ADD CONSTRAINT "_ChampionshipToPlayer_B_fkey" FOREIGN KEY ("B") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
