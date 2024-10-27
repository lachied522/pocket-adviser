import { z } from "zod";

import { getHoldingsWithStocks } from "@/utils/crud/holding";
import { formatDollar } from "@/utils/formatting";

export const description = "Get information about the user's portfolio and their current investments";

export const parameters = z.object({});

export async function getPortfolio(userId?: string|null) {
    try {
        if (!userId) {
            return "The user's portfolio is empty";
        }

        const data = await getHoldingsWithStocks(userId);

        let portfolioValue = 0;
        let totalIncome = 0;
        const sectorTotals: { [sector: string]: number } = {};
        for (const obj of data) {
            const { units, stock } = obj;
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
            holdings: data.map(
                (obj) => ({
                    symbol: obj.stock.symbol,
                    name: obj.stock.name,
                    sector: obj.stock.sector,
                    previousClose: obj.stock.previousClose,
                    units: obj.units,
                    value: formatDollar((obj.stock.previousClose || 0) * obj.units),
                })
            ),
        }
    } catch (e) {
        console.error(`Error getting portfolio: ${e}`);
        return "There was an error calling the function";
    }
}