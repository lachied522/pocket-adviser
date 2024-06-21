
import { z } from "zod";

import type { Recommendation } from "@/types/helpers";

export const description = "Returns a list of recommended transactions for the user based on their current portfolio and investment profile."

export const parameters = z.object({
    target: z.number().describe("The amount the user intends to deposit or withdraw from their portfolio"),
    action: z.enum(["deposit", "withdrawal"]),
})

async function fetchData(target: number, userID?: string) {
    const url = `${process.env.BACKEND_URL}/get-recommendations`;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            target
        }),
        headers: {
            "Content-Type": "application/json",
        }
    })
    .then((res) => {
        if (!res.ok) throw new Error(`Error calling function.`)
        return res.json();
    });

    if (process.env.NODE_ENV==="development") console.log(response);

    return response;
}

type ResolvedPromise<T> = T extends Promise<infer R> ? R: never;

function formatResults(result: ResolvedPromise<ReturnType<typeof fetchData>>) {
    // format results for interpretation by AI
    return result;
}

// it is necessary to define return type as any since the recursiveAICall doesn't know which function it is calling
export async function getRecommendations(target: number, action: "deposit"|"withdrawal"): Promise<Recommendation[]> {
    const results = await fetchData(target);
    return formatResults(results);
}