-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('Pending', 'Completed');

-- CreateTable
CREATE TABLE "RetentionPolicy" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "horizonMonths" INTEGER NOT NULL DEFAULT 6,
    "intervalsDays" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RetentionPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewSchedule" (
    "id" TEXT NOT NULL,
    "taskCardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMPTZ(3) NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'Pending',
    "completedAt" TIMESTAMPTZ(3),
    "intervalDays" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ReviewSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RetentionPolicy_userId_key" ON "RetentionPolicy"("userId");

-- CreateIndex
CREATE INDEX "ReviewSchedule_userId_scheduledFor_idx" ON "ReviewSchedule"("userId", "scheduledFor");

-- CreateIndex
CREATE INDEX "ReviewSchedule_taskCardId_idx" ON "ReviewSchedule"("taskCardId");

-- AddForeignKey
ALTER TABLE "RetentionPolicy" ADD CONSTRAINT "RetentionPolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_taskCardId_fkey" FOREIGN KEY ("taskCardId") REFERENCES "TaskCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewSchedule" ADD CONSTRAINT "ReviewSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
