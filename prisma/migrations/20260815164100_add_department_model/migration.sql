-- CreateTable Department
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- Add columns to Student and Officer
ALTER TABLE "Student" ADD COLUMN "departmentId" TEXT;
ALTER TABLE "Officer" ADD COLUMN "departmentId" TEXT;

-- Indexes
CREATE INDEX "Student_departmentId_idx" ON "Student"("departmentId");
CREATE INDEX "Officer_stageCode_departmentId_idx" ON "Officer"("stageCode", "departmentId");

-- Foreign keys
ALTER TABLE "Student" ADD CONSTRAINT "Student_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Officer" ADD CONSTRAINT "Officer_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
