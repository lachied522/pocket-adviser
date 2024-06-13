/* Gets user portfolio for use in AI completion */

import { getHoldingsWithStocks } from "@/utils/crud/holding";

export const getPortfolioToolSchema = {
    type: "function" as const,
    function: {
        name: "getPortfolio",
        description: "Get information about the user's portfolio and their current investments'",
        parameters: {
            type: "object",
            properties: {},
            required: [],
        }
    }
}

// it is necessary to define return type as any since the recursiveAICall doesn't know which function it is calling
export async function getPortfolio(userID?: string, ...args: any[]): Promise<any> {
    try {
        const data = await getHoldingsWithStocks();
        // format data before returning
        return data.map((obj) => ({
            symbol: obj.stock.symbol,
            name: obj.stock.name,
            sector: obj.stock.sector,
            previousClose: obj.stock.previousClose,
            units: obj.units,
            value: obj.stock.previousClose * obj.units,
        }));
    } catch (e) {
        console.log(e);
        return "There was an error calling the function";
    }
}