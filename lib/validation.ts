import { z } from "zod";
import { CLEARANCE_STAGES, type StageCode } from "./stages";

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(120);
const password = z.string().min(8, "Password must be at least 8 characters").max(72);
const fullName = z.string().trim().min(2, "Enter your full name").max(100);
const requiredText = (label: string) => z.string().trim().min(2, `${label} is required`).max(80);

const stageCodes = CLEARANCE_STAGES.map((s) => s.code) as [StageCode, ...StageCode[]];

export const registerSchema = z.object({
  fullName,
  email,
  password,
  matricNo: z
    .string()
    .trim()
    .min(3, "Enter your matriculation number")
    .max(20)
    .toUpperCase()
    .regex(/^[A-Z0-9/]+$/, "Matric number may only contain letters, numbers and '/'"),
  faculty: requiredText("Faculty"),
  department: requiredText("Department"),
  program: requiredText("Programme"),
  level: z.enum(["100", "200", "300", "400", "500"], { message: "Select your current level" }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const approveItemSchema = z.object({
  itemId: z.string().cuid("Invalid clearance item"),
});

export const rejectItemSchema = z.object({
  itemId: z.string().cuid("Invalid clearance item"),
  comment: z.string().trim().min(5, "A comment is required when rejecting (min 5 characters)").max(500),
});

export const resubmitItemSchema = z.object({
  itemId: z.string().cuid("Invalid clearance item"),
});

export const createOfficerSchema = z.object({
  fullName,
  email,
  password,
  stageCode: z.enum(stageCodes, { message: "Select a clearance stage" }),
});
