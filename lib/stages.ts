import { prisma } from "./db";

export type StageCode = string;

export type StageDefinition = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
};

/** Fetch all active clearance stages from the database, ordered by their display order. */
export async function getStages(): Promise<StageDefinition[]> {
  return prisma.stage.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

/** Look up the display name for a stage code from a pre-fetched stages array. */
export function stageName(code: string, stages: StageDefinition[]): string {
  return stages.find((s) => s.code === code)?.name ?? code;
}
