
import { z } from "zod";

export const description = "Returns a list of recommended transactions for the user based on their current portfolio and investment profile.";

export const parameters = z.object({
    action: z.enum(["deposit", "withdraw", "review"]).describe("The user may wish to deposit or withdraw from their portfolio, or simply have it reviewed.").default("review"),
    target: z.number().optional().describe("The amount the user intends to deposit or withdraw from their portfolio, if any.").default(0),
});

async function fetchData(target: number, action: string, userId?: string|null) {
    const url = new URL(`${process.env.BACKEND_URL}/get-advice`);
    const params = new URLSearchParams();
    if (userId) {
        params.set("userId", userId);
    }
    url.search = params.toString();

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            target,
            action,
        }),
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error(`Error getting recommendations.`)
    }

    return await response.json();
}

function formatResults(result: ReturnType<typeof fetchData>) {
    // format results for interpretation by AI
    return result;
}

export async function getRecommendations(target: number, action: string, userId?: string|null): Promise<any> {
    try {
        const res = await fetchData(target, action, userId);
        if (process.env.NODE_ENV==="development") console.log(res);
        return formatResults(res);
    } catch (e) {
        console.log(e);
        return null;
    }
}