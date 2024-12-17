import { z } from "zod";

export const formSchema = z.object({
    objective: z.enum(["RETIREMENT", "INCOME", "PRESERVATION", "DEPOSIT", "CHILDREN", "TRADING"]).default("RETIREMENT"),
    employmentStatus: z.enum(["STUDENT", "CASUAL", "PARTTIME", "FULLTIME", "SELFEMPLOYED", "FREELANCE", "RETIRED"]).default("STUDENT"),
    milestones: z.object({
        date: z.coerce.date(), // TO DO: add date validation
        target: z.number().min(0),
        description: z.enum(["holiday", "car", "school", "house", "wedding", "kids", "retirement", "other"]),
    }).array().default([]),
    dob: z.date(),
    income: z.coerce.number().min(0).default(10_000),
    percentIncomeInvested: z.number().min(0).max(1).default(0.1),
    percentAssetsInvested: z.number().min(0).max(1).default(0.1),
    experience: z.coerce.number().default(0),
    riskToleranceQ1: z.coerce.number().default(3),
    riskToleranceQ2: z.coerce.number().default(3),
    riskToleranceQ3: z.coerce.number().default(3),
    riskToleranceQ4: z.coerce.number().default(3),
    targetYield: z.number().nullable(),
    international: z.number().nullable(),
    preferences: z.record(
        z.string(),
        z.union([z.literal("like"), z.literal("dislike")]),
    ),
});

export const defaultValues = {
    dob: new Date(),
    objective: "RETIREMENT" as const,
    employmentStatus: "CASUAL" as const,
    income: 0,
    percentIncomeInvested: 0.10,
    percentAssetsInvested: 0.10,
    experience: 1,
    riskToleranceQ1: 3,
    riskToleranceQ2: 3,
    riskToleranceQ3: 3,
    riskToleranceQ4: 3,
    targetYield: 0.01,
    international: 0.7,
    preferences: {},
    milestones: [],
}

export type FormValues = z.infer<typeof formSchema>;