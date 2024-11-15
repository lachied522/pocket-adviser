import { z } from "zod";

import { differenceInMonths } from "date-fns";

import { getProfileByUserId } from "@/utils/crud/profile";
import { formatDollar } from "@/utils/formatting";

import type { Profile } from "@prisma/client";

export const description = "Get information about the user's investment profile";

export function formatProfile(profile: Profile | null) {
    // format profile for interpreation by AI

    if (!profile) {
        // return default values
        return {
            annualIncome: formatDollar(10_000),
            percentIncomeInvested: 0.10,
            targetDividendYield: null,
            targetAllocationToInternational: null,
            sectorPreferences: null,
            milestones: null,
            livesIn: "Australia",
            riskTolerance: "medium",
        }
    }

    // score risk tolerance by 'high', 'low' or 'medium
    let n = 0;
    let riskScore = 0;
    for (const [key, value] of Object.entries(profile)) {
        if (key.startsWith("riskTolerance")) {
            riskScore += value as number;
            n += 1;
        }
    }

    riskScore /= n;

    const riskTolerance = riskScore > 0.66? "high": riskScore > 0.33? "medium": "low";

    // format milestones
    const milestones = Array.isArray(profile.milestones)? profile.milestones.map(
        (milestone: any) => ({
            description: milestone.description,
            targetWealth: milestone.target,
            timeHorizon: differenceInMonths(milestone.date, new Date()),
        })
    ): [];

    return {
        income: formatDollar(profile.income),
        percentIncomeInvested: profile.percentIncomeInvested,
        targetDividendYield: profile.targetYield,
        targetAllocationToInternational: profile.international,
        sectorPreferences: profile.preferences,
        livesIn: "Australia",
        riskTolerance,
        milestones,
    }
}

export const parameters = z.object({});

export async function getProfile(userId: string) {
    try {
        return formatProfile(await getProfileByUserId(userId));
    } catch (e) {
        console.error(`Error getting profile: ${e}`);
        return "There was an error calling the function";
    }
}