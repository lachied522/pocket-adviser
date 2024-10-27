import { z } from "zod";

import { getProfileByUserId } from "@/utils/crud/profile";

export const description = "Get information about the user's investment profile";

export const parameters = z.object({});

export async function getProfile(userId?: string|null) {
    try {
        if (!userId) {
            return "The user's portfolio is empty";
        }

        const data = await getProfileByUserId(userId);

        if (!data) {
            return "The user's profile is currently empty";
        }

        // return in format that is understandable to LLM
        let riskScore = 0;
        let n = 0;
        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith("riskTolerance")) {
                riskScore += value as number;
                n += 1;
            }
        }

        riskScore /= n;

        let riskTolerance: "low"|"medium"|"high" = "low";
        if (riskScore > 3.33) {
            riskTolerance = "high"
        } else if (riskScore > 1.67) {
            riskTolerance = "medium";
        }

        return {
            income: data.income,
            percentIncomeInvested: data.percentIncomeInvested,
            targetYield: data.targetYield,
            targetInternational: data.international,
            preferences: data.preferences,
            milestones: data.milestones,
            riskTolerance,
        }
    } catch (e) {
        console.error(`Error getting profile: ${e}`);
        return "There was an error calling the function";
    }
}