import { z } from "zod";

export const formSchema = z.object({
    // objective: z.enum(["RETIREMENT", "INCOME", "PRESERVATION", "DEPOSIT", "CHILDREN", "TRADING"]),
    milestones: z.object({
        date: z.coerce.date(), // TO DO: add date validation
        target: z.number().min(0),
        description: z.enum(["holiday", "car", "school", "house", "wedding", "kids", "retirement", "other"]),
    }).array().default([]),
    dob: z.date(),
    income: z.coerce.number().min(0).nullable().default(0),
    percentIncomeInvested: z.number().min(0).max(1).nullable().default(0.10),
    experience: z.coerce.number().nullable(),
    riskToleranceQ1: z.coerce.number().nullable().default(3),
    riskToleranceQ2: z.coerce.number().nullable().default(3),
    riskToleranceQ3: z.coerce.number().nullable().default(3),
    riskToleranceQ4: z.coerce.number().nullable().default(3),
    international: z.number().nullable(),
    preferences: z.record(
        z.string(),
        z.union([z.literal("like"), z.literal("dislike")]),
    ),
});

export type FormValues = z.infer<typeof formSchema>;