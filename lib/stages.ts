export const CLEARANCE_STAGES = [
  {
    code: "department",
    name: "Department",
    description: "Sign-off from your Head of Department confirming programme completion.",
  },
  {
    code: "library",
    name: "Library",
    description: "Confirmation that all library materials have been returned.",
  },
  {
    code: "bursary",
    name: "Bursary / Finance",
    description: "Confirmation that there are no outstanding financial obligations.",
  },
  {
    code: "hostel",
    name: "Hostel",
    description: "Confirmation that hostel accommodation has been vacated.",
  },
  {
    code: "sports",
    name: "Sports",
    description: "Return of any sports equipment and clearance of dues.",
  },
  {
    code: "security",
    name: "Security",
    description: "Confirmation of no pending security issues with the institution.",
  },
  {
    code: "ict",
    name: "ICT",
    description: "Closure of institutional accounts and return of ICT assets.",
  },
] as const;

export type StageCode = (typeof CLEARANCE_STAGES)[number]["code"];
export type StageDefinition = (typeof CLEARANCE_STAGES)[number];

export const STAGE_BY_CODE: Record<StageCode, StageDefinition> = Object.fromEntries(
  CLEARANCE_STAGES.map((stage) => [stage.code, stage]),
) as Record<StageCode, StageDefinition>;

export function stageName(code: string): string {
  return STAGE_BY_CODE[code as StageCode]?.name ?? code;
}
