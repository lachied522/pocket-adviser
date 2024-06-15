
export const getRecommendationsSchema = {
    type: "function" as const,
    function: {
        name: "getRecommendations",
        description: "Returns a list of recommended transactions for the user based on their current portfolio and investment profile.",
        parameters: {
            type: "object",
            properties: {
                target: {
                    type: "number",
                    description: "The amount the user intends to deposit (positive) or withdraw (negative) from their portfolio."
                }
            },
            required: ["target"],
        }
    }
}

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
export async function getRecommendations(target: number, userID?: string, ...args: any[]): Promise<any> {
    try {
        const results = await fetchData(target, userID);

        if (process.env.NODE_ENV==="development") console.log(results);

        return formatResults(results);
    } catch (e) {
        console.error(e);
        return "There was an error calling the function";
    }
}