-- CreateTable
CREATE TABLE "player_rating_snapshot" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "championship_id" TEXT,
    "taken_at" TIMESTAMP(3) NOT NULL,
    "scale" TEXT NOT NULL,
    "raw_overall" DOUBLE PRECISION NOT NULL,
    "overall" INTEGER NOT NULL,
    "attack" INTEGER,
    "defense" INTEGER,
    "intelligence" INTEGER,
    "mentality" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_rating_snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "player_rating_snapshot_player_id_championship_id_key" ON "player_rating_snapshot"("player_id", "championship_id");

-- AddForeignKey
ALTER TABLE "player_rating_snapshot" ADD CONSTRAINT "player_rating_snapshot_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "player_rating_snapshot" ADD CONSTRAINT "player_rating_snapshot_championship_id_fkey" FOREIGN KEY ("championship_id") REFERENCES "championship"("id") ON DELETE SET NULL ON UPDATE CASCADE;
