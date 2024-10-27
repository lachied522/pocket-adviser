
import { z } from "zod";

export const description = "Get a list of trade ideas based on the user's current portfolio and investment profile";

export const parameters = z.object({
    action: z.enum(["deposit", "withdraw", "review"]).describe("The user may wish to deposit or withdraw from their portfolio, or simply have it reviewed").default("review"),
    amount: z.number().optional().describe("The amount the user intends to deposit or withdraw from their portfolio, if any").default(0),
});

async function fetchData(amount: number, action: string, userId?: string|null) {
    const url = new URL(`${process.env.BACKEND_URL}/get-advice`);
    const params = new URLSearchParams();
    if (userId) {
        params.set("userId", userId);
    }
    url.search = params.toString();

    // use an abort controller to impose a 58s limit (slightly less than 60s max streaming time)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 58000);
    const response = await fetch(
        url,
        {
            method: "POST",
            signal: controller.signal,
            body: JSON.stringify({
                amount,
                action,
            }),
            headers: {
                "Content-Type": "application/json",
            }
        }
    );

    // Clear the timeout if the request completes in time
    clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(await response.json());
    }

    return await response.json();
}

function formatResults(data: any) {
    // format results for interpretation by AI
    return {
        initialAdjUtility: data.initial_adj_utility,
        finalAdjUtility: data.final_adj_utility,
        total: data.transactions.reduce((acc: number, obj: any) => acc + (obj.units * obj.price), 0),
        transactions: data.transactions.map((obj: any) => ({
            ...obj,
            amount: obj.units * obj.price,
            transaction: obj.units > 0? "Buy": "Sell", // explicitly add 'buy' or 'sell' indicator for AI
        })),
    };
}

export async function getRecommendations(amount: number, action: string, userId?: string|null) {
    try {
        const data = await fetchData(amount, action, userId);
        return formatResults(data);
    } catch (e) {
        console.error("Error getting recommendations: ", e);
        return null;
    }
}