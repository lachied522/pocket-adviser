import { z } from "zod";

export const description = "Display whether a user should buy or sell a stock based on their portfolio and investment profile";

export const parameters = z.object({
    symbol: z.string().describe("The ticker symbol of the stock, e.g. BHP or AAPL"),
    exchange: z.enum(["ASX", "NASDAQ"]).describe("The exchange that the stock trades on").default("NASDAQ"),
    amount: z.number().describe("The proposed amount to be bought (positive) or sold (negative) in dollars. You should ask the user how much they intend to buy or sell.").default(1000),
});

async function fetchData(symbol: string, amount: number, userId?: string|null) {
    const url = new URL(`${process.env.BACKEND_URL}/get-advice-by-stock`);
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
                symbol,
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

function formatResults(result: any) {
    // format results for interpretation by AI
    return result;
}

export async function getStockAdvice(
    symbol: string,
    amount: number,
    exchange: string,
    userId?: string|null,
) {
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