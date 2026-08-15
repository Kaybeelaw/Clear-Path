import "dotenv/config";
import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { deflateSync, crc32 } from "node:zlib";
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "../generated/prisma/client";
import { createPgAdapter } from "../lib/pg-adapter";
import { uploadsDir, writeSeedImage } from "../lib/storage";

const prisma = new PrismaClient({ adapter: createPgAdapter() });

// ─── Tiny PNG helper ──────────────────────────────────────────────────────────

function pngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function onePixelPng(r: number, g: number, b: number): Buffer {
  const raw = Buffer.from([0, r, g, b]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(1, 0);
  ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

async function clearUploadsDir() {
  const dir = uploadsDir();
  try {
    for (const file of await readdir(dir)) {
      await unlink(join(dir, file));
    }
  } catch {
    // directory does not exist yet — that's fine
  }
}

// ─── Seed data definitions ────────────────────────────────────────────────────

const STUDENT_PASSWORD = "Admin@123";
const OFFICER_PASSWORD = "Admin@123";

/** Faculties and their departments */
const FACULTY_SEED = [
  {
    name: "Science",
    departments: ["Computer Science", "Physics", "Mathematics"],
  },
  {
    name: "Engineering",
    departments: ["Electrical Engineering", "Mechanical Engineering", "Civil Engineering"],
  },
  {
    name: "Management Sciences",
    departments: ["Accounting", "Business Administration"],
  },
  {
    name: "Social Sciences",
    departments: ["Economics", "Mass Communication", "Political Science"],
  },
  {
    name: "Health Sciences",
    departments: ["Nursing", "Public Health"],
  },
] as const;

/** The 7 default clearance stages */
const STAGE_SEED = [
  { code: "department", name: "Department",        description: "Sign-off from your Head of Department confirming programme completion.", order: 1 },
  { code: "library",    name: "Library",           description: "Confirmation that all library materials have been returned.",              order: 2 },
  { code: "bursary",    name: "Bursary / Finance", description: "Confirmation that there are no outstanding financial obligations.",        order: 3 },
  { code: "hostel",     name: "Hostel",            description: "Confirmation that hostel accommodation has been vacated.",                 order: 4 },
  { code: "sports",     name: "Sports",            description: "Return of any sports equipment and clearance of dues.",                    order: 5 },
  { code: "security",   name: "Security",          description: "Confirmation of no pending security issues with the institution.",         order: 6 },
  { code: "ict",        name: "ICT",               description: "Closure of institutional accounts and return of ICT assets.",              order: 7 },
] as const;

type StageCode = (typeof STAGE_SEED)[number]["code"];
type ItemStatus = "APPROVED" | "REJECTED" | "PENDING";

type StudentSeed = {
  fullName: string;
  email: string;
  matricNo: string;
  faculty: string;       // matches a FACULTY_SEED name
  department: string;    // matches a department in that faculty
  program: string;
  level: string;
  items: { stageCode: StageCode; status: ItemStatus; comment?: string }[];
};

const STUDENTS: StudentSeed[] = [
  {
    fullName: "Adeola Okafor",
    email: "adeola.okafor@student.example.edu",
    matricNo: "CSC/2021/101",
    faculty: "Science",
    department: "Computer Science",
    program: "B.Sc. Computer Science",
    level: "400",
    items: STAGE_SEED.map((s) => ({ stageCode: s.code, status: "APPROVED" })),
  },
  {
    fullName: "Chinedu Eze",
    email: "chinedu.eze@student.example.edu",
    matricNo: "EEE/2021/204",
    faculty: "Engineering",
    department: "Electrical Engineering",
    program: "B.Eng. Electrical Engineering",
    level: "400",
    items: STAGE_SEED.map((s) => ({ stageCode: s.code, status: "APPROVED" })),
  },
  {
    fullName: "Fatima Bello",
    email: "fatima.bello@student.example.edu",
    matricNo: "ACC/2021/310",
    faculty: "Management Sciences",
    department: "Accounting",
    program: "B.Sc. Accounting",
    level: "400",
    items: [
      { stageCode: "department", status: "APPROVED" },
      { stageCode: "library",    status: "APPROVED" },
      { stageCode: "hostel",     status: "REJECTED", comment: "Outstanding hostel accommodation charges of NGN 15,000 need to be settled." },
      { stageCode: "bursary",    status: "PENDING" },
      { stageCode: "sports",     status: "PENDING" },
      { stageCode: "security",   status: "PENDING" },
      { stageCode: "ict",        status: "PENDING" },
    ],
  },
  {
    fullName: "Oluwaseun Adeyemi",
    email: "oluwaseun.adeyemi@student.example.edu",
    matricNo: "MCM/2021/118",
    faculty: "Social Sciences",
    department: "Mass Communication",
    program: "B.Sc. Mass Communication",
    level: "400",
    items: [
      { stageCode: "department", status: "APPROVED" },
      { stageCode: "library",    status: "PENDING" },
      { stageCode: "bursary",    status: "PENDING" },
      { stageCode: "hostel",     status: "PENDING" },
      { stageCode: "sports",     status: "PENDING" },
      { stageCode: "security",   status: "PENDING" },
      { stageCode: "ict",        status: "PENDING" },
    ],
  },
  {
    fullName: "Ngozi Umeh",
    email: "ngozi.umeh@student.example.edu",
    matricNo: "ECO/2021/087",
    faculty: "Social Sciences",
    department: "Economics",
    program: "B.Sc. Economics",
    level: "400",
    items: STAGE_SEED.map((s) => ({ stageCode: s.code, status: "APPROVED" })),
  },
  {
    fullName: "Ibrahim Musa",
    email: "ibrahim.musa@student.example.edu",
    matricNo: "CSC/2021/154",
    faculty: "Science",
    department: "Computer Science",
    program: "B.Sc. Computer Science",
    level: "400",
    items: STAGE_SEED.map((s) => ({ stageCode: s.code, status: "PENDING" })),
  },
  {
    fullName: "Blessing Okoro",
    email: "blessing.okoro@student.example.edu",
    matricNo: "NUR/2021/220",
    faculty: "Health Sciences",
    department: "Nursing",
    program: "B.NSc. Nursing",
    level: "400",
    items: [
      { stageCode: "department", status: "APPROVED" },
      { stageCode: "library",    status: "APPROVED" },
      { stageCode: "bursary",    status: "APPROVED" },
      { stageCode: "hostel",     status: "PENDING" },
      { stageCode: "sports",     status: "PENDING" },
      { stageCode: "security",   status: "PENDING" },
      { stageCode: "ict",        status: "PENDING" },
    ],
  },
  {
    fullName: "Tunde Bakare",
    email: "tunde.bakare@student.example.edu",
    matricNo: "MEE/2021/142",
    faculty: "Engineering",
    department: "Mechanical Engineering",
    program: "B.Eng. Mechanical Engineering",
    level: "400",
    items: [
      { stageCode: "department", status: "APPROVED" },
      { stageCode: "library",    status: "REJECTED", comment: "One borrowed textbook has not yet been returned to the library." },
      { stageCode: "bursary",    status: "PENDING" },
      { stageCode: "hostel",     status: "PENDING" },
      { stageCode: "sports",     status: "PENDING" },
      { stageCode: "security",   status: "PENDING" },
      { stageCode: "ict",        status: "PENDING" },
    ],
  },
  {
    fullName: "Halima Sadiq",
    email: "halima.sadiq@student.example.edu",
    matricNo: "CSC/2021/133",
    faculty: "Science",
    department: "Computer Science",
    program: "B.Sc. Computer Science",
    level: "400",
    items: STAGE_SEED.map((s) => ({ stageCode: s.code, status: "APPROVED" })),
  },
  {
    fullName: "Kelechi Ani",
    email: "kelechi.ani@student.example.edu",
    matricNo: "ACC/2021/267",
    faculty: "Management Sciences",
    department: "Accounting",
    program: "B.Sc. Accounting",
    level: "400",
    items: [
      { stageCode: "department", status: "APPROVED" },
      { stageCode: "library",    status: "APPROVED" },
      { stageCode: "bursary",    status: "APPROVED" },
      { stageCode: "hostel",     status: "APPROVED" },
      { stageCode: "sports",     status: "PENDING" },
      { stageCode: "security",   status: "PENDING" },
      { stageCode: "ict",        status: "PENDING" },
    ],
  },
];

const DEMO_DOCS: Record<string, StageCode[]> = {
  "CSC/2021/101": ["department", "library", "bursary"],
  "EEE/2021/204": ["department"],
  "ACC/2021/310": ["hostel", "bursary", "sports"],
  "MCM/2021/118": ["library", "bursary"],
  "ECO/2021/087": ["department"],
  "CSC/2021/154": ["department", "library", "bursary"],
  "NUR/2021/220": ["hostel", "sports"],
  "MEE/2021/142": ["library", "sports"],
  "CSC/2021/133": ["department"],
  "ACC/2021/267": ["sports", "security"],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Admin account (idempotent)
  const adminEmail = "admin@clearpath.edu";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hash("admin123", 12),
        fullName: "System Administrator",
        role: "ADMIN",
      },
    });
    console.log("Created admin account: admin@clearpath.edu / admin123");
  }

  // Wipe existing student/officer/record data (leave admin intact)
  await prisma.document.deleteMany();
  await prisma.clearanceItem.deleteMany();
  await prisma.clearanceRecord.deleteMany();
  await prisma.student.deleteMany();
  await prisma.officer.deleteMany();
  await prisma.user.deleteMany({ where: { role: { in: ["STUDENT", "OFFICER"] } } });
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.stage.deleteMany();
  await clearUploadsDir();

  // ── Seed stages ──────────────────────────────────────────────────────────
  for (const s of STAGE_SEED) {
    await prisma.stage.create({
      data: { code: s.code, name: s.name, description: s.description, order: s.order, isActive: true },
    });
  }
  console.log(`Seeded ${STAGE_SEED.length} clearance stages.`);

  // ── Seed faculties + departments ─────────────────────────────────────────
  const facultyMap = new Map<string, string>(); // faculty name → id
  const departmentMap = new Map<string, string>(); // department name → id

  for (const fac of FACULTY_SEED) {
    const created = await prisma.faculty.create({ data: { name: fac.name } });
    facultyMap.set(fac.name, created.id);

    for (const deptName of fac.departments) {
      const dept = await prisma.department.create({
        data: { name: deptName, facultyId: created.id },
      });
      departmentMap.set(deptName, dept.id);
    }
  }
  console.log(`Seeded ${FACULTY_SEED.length} faculties and ${departmentMap.size} departments.`);

  // ── Seed officers ────────────────────────────────────────────────────────
  const officerByStage = new Map<string, string>(); // stageCode → officer id

  const OFFICER_NAMES: Record<StageCode, string> = {
    department: "Dr. Amina Yusuf",
    library:    "Mr. Samuel Ogunleye",
    bursary:    "Mrs. Chinwe Nwosu",
    hostel:     "Mr. Emeka Obi",
    sports:     "Coach David Balogun",
    security:   "Cpl. Fatima Kareem",
    ict:        "Engr. Tunde Adeleke",
  };

  // Non-department officers (one per non-department stage)
  for (const stage of STAGE_SEED) {
    if (stage.code === "department") continue;
    const email = `${stage.code}@clearpath.edu`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hash(OFFICER_PASSWORD, 12),
        fullName: OFFICER_NAMES[stage.code],
        role: "OFFICER",
        officer: { create: { stageCode: stage.code, stageName: stage.name } },
      },
      include: { officer: true },
    });
    officerByStage.set(stage.code, user.officer!.id);
  }

  // Department-stage officer per department
  for (const fac of FACULTY_SEED) {
    for (const deptName of fac.departments) {
      const deptId = departmentMap.get(deptName)!;
      const slug = deptName.replace(/\s+/g, "").toLowerCase();
      const email = `department+${slug}@clearpath.edu`;
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: await hash(OFFICER_PASSWORD, 12),
          fullName: `Head of ${deptName}`,
          role: "OFFICER",
          officer: {
            create: { stageCode: "department", stageName: "Department", departmentId: deptId },
          },
        },
        include: { officer: true },
      });
      // Keep the last one for seed convenience (students below use it)
      officerByStage.set(`department:${deptName}`, user.officer!.id);
    }
  }
  console.log("Seeded officer accounts.");

  // ── Seed students ────────────────────────────────────────────────────────
  for (const [index, seed] of STUDENTS.entries()) {
    const createdAt = new Date(Date.now() - (STUDENTS.length - index) * 2 * 24 * 60 * 60 * 1000);
    const facultyId = facultyMap.get(seed.faculty) ?? null;
    const deptId = departmentMap.get(seed.department) ?? null;

    const user = await prisma.user.create({
      data: {
        email: seed.email,
        passwordHash: await hash(STUDENT_PASSWORD, 12),
        fullName: seed.fullName,
        role: "STUDENT",
        student: {
          create: {
            matricNo: seed.matricNo,
            facultyId,
            departmentId: deptId,
            program: seed.program,
            level: seed.level,
          },
        },
      },
      include: { student: true },
    });

    const studentId = user.student!.id;
    const allApproved = seed.items.every((item) => item.status === "APPROVED");

    const record = await prisma.clearanceRecord.create({
      data: {
        studentId,
        status: allApproved ? "COMPLETE" : "IN_PROGRESS",
        createdAt,
        updatedAt: createdAt,
        completedAt: allApproved
          ? new Date(createdAt.getTime() + 12 * 24 * 60 * 60 * 1000)
          : null,
        items: {
          create: seed.items.map((item, itemIndex) => {
            const stage = STAGE_SEED.find((s) => s.code === item.stageCode)!;
            const actedAt = new Date(createdAt.getTime() + (itemIndex + 1) * 24 * 60 * 60 * 1000);
            const decided = item.status !== "PENDING";
            // For department stage use the per-department officer id
            const officerId = decided
              ? item.stageCode === "department"
                ? (officerByStage.get(`department:${seed.department}`) ?? null)
                : (officerByStage.get(item.stageCode) ?? null)
              : null;
            return {
              stageCode: stage.code,
              stageName: stage.name,
              stageOrder: stage.order,
              status: item.status,
              officerId,
              comment: item.status === "REJECTED" ? (item.comment ?? null) : null,
              actedAt: decided ? actedAt : null,
            };
          }),
        },
      },
    });

    console.log(
      `Created student ${seed.fullName} (${seed.matricNo}) — ${record.status} ` +
        `(${seed.items.filter((i) => i.status === "APPROVED").length}/${seed.items.length})`,
    );

    // Seed demo documents
    const demoStages = DEMO_DOCS[seed.matricNo];
    if (demoStages) {
      const items = await prisma.clearanceItem.findMany({ where: { recordId: record.id } });
      for (const [docIndex, stageCode] of demoStages.entries()) {
        const item = items.find((i) => i.stageCode === stageCode);
        if (!item) continue;
        const storedName = `seed-${randomUUID()}.png`;
        const colour = [64 + (docIndex * 60) % 160, 120, 200 - (docIndex * 30) % 120];
        await writeSeedImage(storedName, onePixelPng(colour[0], colour[1], colour[2]));
        await prisma.document.create({
          data: {
            itemId: item.id,
            studentId,
            originalName: `${stageCode}-evidence.png`,
            storedName,
            mimeType: "image/png",
            sizeBytes: 71,
          },
        });
      }
    }
  }
}

main()
  .then(() => console.log("Seed complete."))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
