
export const shouldBuyOrSellStockSchema = {
    type: "function" as const,
    function: {
        name: "shouldBuyOrSellStock",
        description: "Returns whether the user should buy or sell a stock based on their current portfolio and investment profile",
        parameters: {
            type: "object",
            properties: {
                symbol: {
                    type: "string",
                    description: "The ticker symbol of the stock, e.g. BHP or AAPL."
                },
                amount: {
                    type: "number",
                    description: "The proposed amount to be bought (positive) or sold (negative) in dollars. Must be non-zero."
                }
            },
            required: ["symbol", "amount"],
        }
    }
}

async function fetchData(symbol: string, amount: number, userID?: string) {
    const url = `${process.env.BACKEND_URL}/get-advice-by-stock`;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
            amount,
            symbol,
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
export async function shouldBuyOrSellStock(symbol: string, amount: number, userID?: string, ...args: any[]): Promise<any> {
    try {
        if (amount===0) {
            return "What amount in dollars are you looking to invest?";
        }

        const results = await fetchData(symbol, amount, userID);

        if (process.env.NODE_ENV==="development") console.log(results);

        return formatResults(results);
    } catch (e) {
        console.log(e);

        return "There was an error calling the function";
    }
}