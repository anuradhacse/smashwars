-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('ok', 'stale', 'in_progress', 'failed');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('player', 'event', 'club');

-- CreateTable
CREATE TABLE "Player" (
    "id" INTEGER NOT NULL,
    "displayName" TEXT NOT NULL,
    "clubId" INTEGER,
    "lastSyncedAt" TIMESTAMP(3),
    "syncStatus" "SyncStatus" NOT NULL DEFAULT 'stale',
    "syncError" TEXT,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerHistory" (
    "playerId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT NOT NULL,
    "initialMean" INTEGER NOT NULL,
    "initialStDev" INTEGER NOT NULL,
    "pointChange" INTEGER NOT NULL,
    "finalMean" INTEGER NOT NULL,
    "finalStDev" INTEGER NOT NULL,

    CONSTRAINT "PlayerHistory_pkey" PRIMARY KEY ("playerId","eventId")
);

-- CreateTable
CREATE TABLE "EventSummary" (
    "eventId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "initialMean" INTEGER NOT NULL,
    "initialStDev" INTEGER NOT NULL,
    "pointChange" INTEGER NOT NULL,
    "finalMean" INTEGER NOT NULL,
    "finalStDev" INTEGER NOT NULL,

    CONSTRAINT "EventSummary_pkey" PRIMARY KEY ("eventId","playerId")
);

-- CreateTable
CREATE TABLE "EventMatch" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "winnerId" INTEGER NOT NULL,
    "loserId" INTEGER NOT NULL,
    "score" TEXT NOT NULL,
    "winnerDelta" INTEGER NOT NULL,
    "winnerOppMean" INTEGER NOT NULL,
    "winnerOppStDev" INTEGER NOT NULL,
    "loserDelta" INTEGER NOT NULL,
    "loserOppMean" INTEGER NOT NULL,
    "loserOppStDev" INTEGER NOT NULL,
    "matchesPairPlayed" INTEGER NOT NULL,
    "rowIndex" INTEGER NOT NULL,

    CONSTRAINT "EventMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncJob" (
    "id" SERIAL NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" INTEGER NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'in_progress',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "SyncJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlayerHistory_playerId_eventDate_idx" ON "PlayerHistory"("playerId", "eventDate");

-- CreateIndex
CREATE INDEX "EventMatch_eventId_idx" ON "EventMatch"("eventId");

-- CreateIndex
CREATE INDEX "SyncJob_entityType_entityId_idx" ON "SyncJob"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "PlayerHistory" ADD CONSTRAINT "PlayerHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSummary" ADD CONSTRAINT "EventSummary_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSummary" ADD CONSTRAINT "EventSummary_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMatch" ADD CONSTRAINT "EventMatch_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
