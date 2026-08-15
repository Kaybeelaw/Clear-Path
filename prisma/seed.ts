import "dotenv/config";
import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { deflateSync, crc32 } from "node:zlib";
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "../generated/prisma/client";
import { createPgAdapter } from "../lib/pg-adapter";
import { CLEARANCE_STAGES, type StageCode } from "../lib/stages";
import { uploadsDir, writeSeedImage } from "../lib/storage";

const prisma = new PrismaClient({ adapter: createPgAdapter() });

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
    // directory does not exist yet
  }
}

const STUDENT_PASSWORD = "Admin@123";
const OFFICER_PASSWORD = "Admin@123";

const OFFICER_NAMES: Record<StageCode, string> = {
  department: "Dr. Amina Yusuf",
  library: "Mr. Samuel Ogunleye",
  bursary: "Mrs. Chinwe Nwosu",
  hostel: "Mr. Emeka Obi",
  sports: "Coach David Balogun",
  security: "Cpl. Fatima Kareem",
  ict: "Engr. Tunde Adeleke",
};

type ItemStatus = "APPROVED" | "REJECTED" | "PENDING";

type StudentSeed = {
  fullName: string;
  email: string;
  matricNo: string;
  faculty: string;
  department: string;
  program: string;
  level: string;
  items: { stageCode: StageCode; status: ItemStatus; comment?: string }[];
};

const students: StudentSeed[] = [
  {
    fullName: "Adeola Okafor",
    email: "adeola.okafor@student.example.edu",
    matricNo: "CSC/2021/101",
    faculty: "Science",
    department: "Computer Science",
    program: "B.Sc. Computer Science",
    level: "400",
    items: CLEARANCE_STAGES.map((stage) => ({ stageCode: stage.code, status: "APPROVED" })),
  },
  {
    fullName: "Chinedu Eze",
    email: "chinedu.eze@student.example.edu",
    matricNo: "EEE/2021/204",
    faculty: "Engineering",
    department: "Electrical Engineering",
    program: "B.Eng. Electrical Engineering",
    level: "400",
    items: CLEARANCE_STAGES.map((stage) => ({ stageCode: stage.code, status: "APPROVED" })),
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
      { stageCode: "library", status: "APPROVED" },
      {
        stageCode: "hostel",
        status: "REJECTED",
        comment: "Outstanding hostel accommodation charges of NGN 15,000 need to be settled.",
      },
      { stageCode: "bursary", status: "PENDING" },
      { stageCode: "sports", status: "PENDING" },
      { stageCode: "security", status: "PENDING" },
      { stageCode: "ict", status: "PENDING" },
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
      { stageCode: "library", status: "PENDING" },
      { stageCode: "bursary", status: "PENDING" },
      { stageCode: "hostel", status: "PENDING" },
      { stageCode: "sports", status: "PENDING" },
      { stageCode: "security", status: "PENDING" },
      { stageCode: "ict", status: "PENDING" },
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
    items: CLEARANCE_STAGES.map((stage) => ({ stageCode: stage.code, status: "APPROVED" })),
  },
  {
    fullName: "Ibrahim Musa",
    email: "ibrahim.musa@student.example.edu",
    matricNo: "CSC/2021/154",
    faculty: "Science",
    department: "Computer Science",
    program: "B.Sc. Computer Science",
    level: "400",
    items: CLEARANCE_STAGES.map((stage) => ({ stageCode: stage.code, status: "PENDING" })),
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
      { stageCode: "library", status: "APPROVED" },
      { stageCode: "bursary", status: "APPROVED" },
      { stageCode: "hostel", status: "PENDING" },
      { stageCode: "sports", status: "PENDING" },
      { stageCode: "security", status: "PENDING" },
      { stageCode: "ict", status: "PENDING" },
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
      {
        stageCode: "library",
        status: "REJECTED",
        comment: "One borrowed textbook has not yet been returned to the library.",
      },
      { stageCode: "bursary", status: "PENDING" },
      { stageCode: "hostel", status: "PENDING" },
      { stageCode: "sports", status: "PENDING" },
      { stageCode: "security", status: "PENDING" },
      { stageCode: "ict", status: "PENDING" },
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
    items: CLEARANCE_STAGES.map((stage) => ({ stageCode: stage.code, status: "APPROVED" })),
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
      { stageCode: "library", status: "APPROVED" },
      { stageCode: "bursary", status: "APPROVED" },
      { stageCode: "hostel", status: "APPROVED" },
      { stageCode: "sports", status: "PENDING" },
      { stageCode: "security", status: "PENDING" },
      { stageCode: "ict", status: "PENDING" },
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

async function main() {
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

  await prisma.clearanceItem.deleteMany();
  await prisma.clearanceRecord.deleteMany();
  await prisma.student.deleteMany();
  await prisma.officer.deleteMany();
  await prisma.user.deleteMany({ where: { role: { in: ["STUDENT", "OFFICER"] } } });
  await prisma.document.deleteMany();
  await clearUploadsDir();

  const officerByStage = new Map<StageCode, string>();

  // Create non-department officers (one per stage)
  for (const stage of CLEARANCE_STAGES) {
    if (stage.code === "department") continue; // create department officers per-department below
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
  console.log(`Created ${CLEARANCE_STAGES.length - 1} non-department officer accounts (password: ${OFFICER_PASSWORD})`);

  // Create departments from seed list and department-stage officers per department
  const deptNames = Array.from(new Set(students.map((s) => s.department)));
  const departmentMap = new Map<string, { id: string; name: string }>();
  for (const name of deptNames) {
    const dept = await prisma.department.create({ data: { name } });
    departmentMap.set(name, { id: dept.id, name: dept.name });

    // create a department-stage officer for this department
    const email = `department+${dept.name.replace(/\s+/g, "").toLowerCase()}@clearpath.edu`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hash(OFFICER_PASSWORD, 12),
        fullName: `Head of ${dept.name}`,
        role: "OFFICER",
        officer: { create: { stageCode: "department", stageName: "Department", departmentId: dept.id } },
      },
      include: { officer: true },
    });
    officerByStage.set("department", user.officer!.id);
  }

  for (const [index, seed] of students.entries()) {
    const createdAt = new Date(Date.now() - (students.length - index) * 2 * 24 * 60 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email: seed.email,
        passwordHash: await hash(STUDENT_PASSWORD, 12),
        fullName: seed.fullName,
        role: "STUDENT",
        student: {
          create: {
            matricNo: seed.matricNo,
            faculty: seed.faculty,
            departmentId: departmentMap.get(seed.department)?.id ?? null,
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
        completedAt: allApproved ? new Date(createdAt.getTime() + 12 * 24 * 60 * 60 * 1000) : null,
        items: {
          create: seed.items.map((item, itemIndex) => {
            const actedAt = new Date(createdAt.getTime() + (itemIndex + 1) * 24 * 60 * 60 * 1000);
            const decided = item.status !== "PENDING";
            return {
              stageCode: item.stageCode,
              stageName: CLEARANCE_STAGES.find((s) => s.code === item.stageCode)!.name,
              stageOrder: itemIndex + 1,
              status: item.status,
              officerId: decided ? officerByStage.get(item.stageCode) ?? null : null,
              comment: item.status === "REJECTED" ? item.comment : null,
              actedAt: decided ? actedAt : null,
            };
          }),
        },
      },
    });

    console.log(
      `Created student ${seed.fullName} (${seed.matricNo}) — ${record.status} (${seed.items.filter((i) => i.status === "APPROVED").length}/${seed.items.length})`,
    );

    const demoStages = DEMO_DOCS[seed.matricNo];
    if (demoStages) {
      const items = await prisma.clearanceItem.findMany({
        where: { recordId: record.id },
      });
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
