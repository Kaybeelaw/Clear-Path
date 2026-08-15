-- DropIndex
DROP INDEX "Officer_stageCode_idx";

-- DropIndex
DROP INDEX "Officer_stageCode_key";

-- AlterTable
ALTER TABLE "Officer" ADD COLUMN     "department" TEXT;

-- CreateIndex
CREATE INDEX "Officer_stageCode_department_idx" ON "Officer"("stageCode", "department");
