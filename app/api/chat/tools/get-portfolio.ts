import { z } from "zod";

import { getHoldingsWithStocks } from "@/utils/crud/holding";
import { formatDollar } from "@/utils/formatting";
import { ResolvedPromise } from "@/types/helpers";

export const description = "Get information about the user's portfolio and their current investments";

export const parameters = z.object({});

export function formatPortfolio(holdings: ResolvedPromise<ReturnType<typeof getHoldingsWithStocks>>) {
    let portfolioValue = 0;
    let totalIncome = 0;
    const sectorTotals: { [sector: string]: number } = {};
    for (const holding of holdings) {
        const { units, stock } = holding;
        // increment portfolio value
        portfolioValue += units * (stock.previousClose || 0);
        // increment portfolio income
        totalIncome += units * (stock.dividendAmount || 0);
        // increment sector allocation
        if (stock.sector) {
            if (stock.sector in sectorTotals) {
                sectorTotals[stock.sector] += units * (stock.previousClose || 0);
            } else {
                sectorTotals[stock.sector] = units * (stock.previousClose || 0);
            }
        }
    }

    const sectorAllocations = Object.keys(sectorTotals).reduce<{ [sector: string]: string }>((acc, sector) => {
        acc[sector] = ((sectorTotals[sector] / portfolioValue) * 100).toFixed(2) + '%';
        return acc;
    }, {});

    return {
        portfolioValue: formatDollar(portfolioValue),
        totalIncome: formatDollar(totalIncome),
        incomeYield: (100 * totalIncome / portfolioValue).toFixed(2) + '%',
        sectorAllocations,
        holdings: holdings.map(
            (holding) => ({
                symbol: holding.stock.symbol,
                name: holding.stock.name,
                sector: holding.stock.sector,
                previousClose: holding.stock.previousClose,
                units: holding.units,
                value: formatDollar((holding.stock.previousClose || 0) * holding.units),
            })
        ),
    }
}

export async function getPortfolio(userId: string) {
    try {
        return formatPortfolio(await getHoldingsWithStocks(userId));        
    } catch (e) {
        console.error(`Error getting portfolio: ${e}`);
        return "There was an error calling the function";
    }
}