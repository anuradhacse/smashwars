-- AlterTable
ALTER TABLE "EventMatch" ADD COLUMN     "playerId" INTEGER;

-- AlterTable
ALTER TABLE "EventSummary" ADD COLUMN     "playerName" TEXT;

-- CreateTable
CREATE TABLE "Club" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'stale',
    "syncError" TEXT,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMember" (
    "clubId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "rank" INTEGER,
    "ratingMean" INTEGER,
    "ratingStDev" INTEGER,
    "lastPlayedDate" TIMESTAMP(3),
    "displayName" TEXT NOT NULL,

    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("clubId","playerId")
);

-- CreateIndex
CREATE INDEX "ClubMember_playerId_idx" ON "ClubMember"("playerId");

-- CreateIndex
CREATE INDEX "EventMatch_playerId_idx" ON "EventMatch"("playerId");

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
