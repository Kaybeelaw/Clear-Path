-- CreateTable Faculty
CREATE TABLE "Faculty" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Faculty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on Faculty
CREATE UNIQUE INDEX "Faculty_name_key" ON "Faculty"("name");
CREATE INDEX "Faculty_name_idx" ON "Faculty"("name");

-- CreateTable Stage
CREATE TABLE "Stage" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Stage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex on Stage
CREATE UNIQUE INDEX "Stage_code_key" ON "Stage"("code");
CREATE INDEX "Stage_order_idx" ON "Stage"("order");

-- Insert the 7 default clearance stages
INSERT INTO "Stage" ("id", "code", "name", "description", "order", "isActive", "createdAt") VALUES
  (gen_random_uuid()::text, 'department', 'Department',       'Sign-off from your Head of Department confirming programme completion.', 1, true, NOW()),
  (gen_random_uuid()::text, 'library',    'Library',          'Confirmation that all library materials have been returned.',              2, true, NOW()),
  (gen_random_uuid()::text, 'bursary',    'Bursary / Finance','Confirmation that there are no outstanding financial obligations.',        3, true, NOW()),
  (gen_random_uuid()::text, 'hostel',     'Hostel',           'Confirmation that hostel accommodation has been vacated.',                 4, true, NOW()),
  (gen_random_uuid()::text, 'sports',     'Sports',           'Return of any sports equipment and clearance of dues.',                    5, true, NOW()),
  (gen_random_uuid()::text, 'security',   'Security',         'Confirmation of no pending security issues with the institution.',         6, true, NOW()),
  (gen_random_uuid()::text, 'ict',        'ICT',              'Closure of institutional accounts and return of ICT assets.',              7, true, NOW());

-- Insert the 5 seed faculties
INSERT INTO "Faculty" ("id", "name", "createdAt") VALUES
  (gen_random_uuid()::text, 'Science',              NOW()),
  (gen_random_uuid()::text, 'Engineering',          NOW()),
  (gen_random_uuid()::text, 'Management Sciences',  NOW()),
  (gen_random_uuid()::text, 'Social Sciences',      NOW()),
  (gen_random_uuid()::text, 'Health Sciences',      NOW());

-- Add facultyId to Department
ALTER TABLE "Department" ADD COLUMN "facultyId" TEXT;
CREATE INDEX "Department_facultyId_idx" ON "Department"("facultyId");
ALTER TABLE "Department" ADD CONSTRAINT "Department_facultyId_fkey"
  FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add facultyId to Student (nullable for safe migration)
ALTER TABLE "Student" ADD COLUMN "facultyId" TEXT;
CREATE INDEX "Student_facultyId_idx" ON "Student"("facultyId");

-- Migrate existing Student.faculty string → facultyId FK
UPDATE "Student" s
SET "facultyId" = f.id
FROM "Faculty" f
WHERE s.faculty = f.name;

-- Add FK constraint after data is migrated
ALTER TABLE "Student" ADD CONSTRAINT "Student_facultyId_fkey"
  FOREIGN KEY ("facultyId") REFERENCES "Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old Student.faculty text column
ALTER TABLE "Student" DROP COLUMN "faculty";
