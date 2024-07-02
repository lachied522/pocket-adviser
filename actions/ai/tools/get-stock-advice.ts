import { z } from "zod";

export const description = "Returns whether the user should buy or sell a stock based on their current portfolio and investment profile";

export const parameters = z.object({
    symbol: z.string().describe("The ticker symbol of the stock, e.g. BHP or AAPL"),
    exchange: z.enum(["ASX", "NASDAQ"]).describe("The exchange that the stock trades on").default("NASDAQ"),
    amount: z.number().describe("The proposed amount to be bought (positive) or sold (negative) in dollars. You should ask the user how much they intend to buy or sell."),
});

async function fetchData(symbol: string, amount: number, userId?: string|null) {
    const url = new URL(`${process.env.BACKEND_URL}/get-advice-by-stock`);
    const params = new URLSearchParams();
    if (userId) {
        params.set("userId", userId);
    }
    url.search = params.toString();
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

    return response;
}

function formatResults(result: any) {
    // format results for interpretation by AI
    return result;
}

// it is necessary to define return type as any since the recursiveAICall doesn't know which function it is calling
export async function getStockAdvice(symbol: string, amount: number, exchange: string, userId?: string|null, ...args: any[]): Promise<any> {
    try {
        if (amount===0) {
            // TO DO: handle this
            return "What amount in dollars are you looking to invest?";
        }
        // add '.AX' if exchange is ASX
        if (exchange === 'ASX' && !symbol.endsWith('.AX')) {
            symbol = `${symbol}.AX`;
        }
        const res = await fetchData(symbol, amount, userId);
        return formatResults(res);
    } catch (e) {
        return null;
    }
}