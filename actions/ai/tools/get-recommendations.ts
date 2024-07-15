
import { z } from "zod";

export const description = "Display a list of trade ideas to the user based on their current portfolio and investment profile.";

export const parameters = z.object({
    action: z.enum(["deposit", "withdraw", "review"]).describe("The user may wish to deposit or withdraw from their portfolio, or simply have it reviewed.").default("review"),
    amount: z.number().optional().describe("The amount the user intends to deposit or withdraw from their portfolio, if any.").default(0),
});

async function fetchData(amount: number, action: string, userId?: string|null) {
    const url = new URL(`${process.env.BACKEND_URL}/get-advice`);
    const params = new URLSearchParams();
    if (userId) {
        params.set("userId", userId);
    }
    url.search = params.toString();

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            amount,
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

function formatResults(res: any) {
    // format results for interpretation by AI
    return {
        initialAdjUtility: res.initial_adj_utility,
        finalAdjUtility: res.final_adj_utility,
        total: res.transactions.reduce((acc: number, obj: any) => acc + (obj.units * obj.price), 0),
        transactions: res.transactions.map((obj: any) => ({
            ...obj,
            amount: obj.units * obj.price,
            transaction: obj.units > 0? "Buy": "Sell", // explicitly add 'buy' or 'sell' indicator for AI
        })),
    };
}

export async function getRecommendations(amount: number, action: string, userId?: string|null): Promise<any> {
    try {
        const res = await fetchData(amount, action, userId);
        return formatResults(res);
    } catch (e) {
        console.log(e);
        return null;
    }
}