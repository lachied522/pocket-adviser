import { z } from "zod";

import { getHoldingsWithStocks } from "@/utils/crud/holding";
import { getStockBySymbol } from "@/utils/crud/stocks";

import { getAnalystResearch } from "./get-analyst-research";

import type { Holding, Profile, Stock } from "@prisma/client";

import type { ResolvedPromise } from "@/types/helpers";
import { getProfileByUserId } from "@/utils/crud/profile";

export const description = "Get everything you need to determine whether the user should buy or sell a stock";

export const parameters = z.object({
    symbol: z.string().describe("The ticker symbol of the stock, e.g. BHP or AAPL"),
    exchange: z.enum(["ASX", "NASDAQ"]).describe("The exchange that the stock trades on").default("NASDAQ"),
    action: z.enum(["buy", "sell"]).describe("Whether the user wishes to buy or sell the stock"),
    amount: z.number().describe("The proposed amount to buy or sell.").default(0),
});

async function fetchUtility(
    body: {
        symbol: string, amount: number
    },
    userId: string
) {
    const url = new URL(`${process.env.BACKEND_URL}/utility`);
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
            body: JSON.stringify(body),
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

function decimalToPercent(value: number) {
    return (100 * value).toFixed(2);
}

function sectorAllocation({
    stock,
    amount,
    holdings,
} : {
    stock: Stock
    amount: number
    holdings: ResolvedPromise<ReturnType<typeof getHoldingsWithStocks>>
}) {
    let sectorValue = 0;
    let portfolioValue = 0;

    if (!stock.sector) {
        return "No sector information was found.";
    }

    for (const holding of holdings) {
        const value = (holding.stock.previousClose || 0) * holding.units;
        portfolioValue += value;
        if (holding.stock.sector === stock.sector) {
            sectorValue += value;
        }
    }

    return (
`The user's current allocation to the ${stock.sector} sector is ${decimalToPercent(sectorValue / portfolioValue)}. 
The proposed transaction will change the allocation to ${decimalToPercent((sectorValue + amount) / (portfolioValue + amount))}`
    );
}

function risk({
    stock,
    amount,
    holdings,
} : {
    stock: Stock
    amount: number
    holdings: ResolvedPromise<ReturnType<typeof getHoldingsWithStocks>>
}) {
    let weightedBeta = 0;
    let portfolioValue = 0;

    for (const holding of holdings) {
        const value = (holding.stock.previousClose || 0) * holding.units;
        weightedBeta += value * (holding.stock.beta || 0);
        portfolioValue += value;
    }

    return (
`The user's current weighted average Beta is ${decimalToPercent(weightedBeta / portfolioValue)}%. 
The proposed transaction will change weighted average Beta to ${decimalToPercent((weightedBeta + (amount * (stock.beta || 0))) / (portfolioValue + amount))}%`
    );
}

function income({
    stock,
    amount,
    holdings,
} : {
    stock: Stock
    amount: number
    holdings: ResolvedPromise<ReturnType<typeof getHoldingsWithStocks>>
}) {
    let totalIncome = 0;
    let portfolioValue = 0;

    for (const holding of holdings) {
        totalIncome += (holding.stock.dividendAmount || 0) * holding.units;
        portfolioValue += (holding.stock.previousClose || 0) * holding.units;
    }

    return (
`The user's current portfolio yield is ${decimalToPercent(totalIncome / portfolioValue)}%. 
The proposed transaction will change portfolio yield to ${decimalToPercent((totalIncome + (amount * (stock.dividendAmount || 0))) / (portfolioValue + amount))}%`
    );
}

function formatStockData(stockData: Stock) {
    // format stock data for interpretation by AI
    return {
        symbol: stockData.symbol,
        name: stockData.name,
        country: stockData.country,
        changesPercentage: stockData.changesPercentage,
        previousClose: stockData.previousClose,
        description: stockData.description,
        marketCap: stockData.marketCap,
    };
}

function formatProfile(profile: Profile | null) {
    if (!profile) {
        return null;
    }
    // format profile for interpreation by AI
    const riskScore = Object.entries(profile).reduce((sum, [key, value]) => sum + (key.startsWith("riskTolerance")? Number(value) / 5: 0), 0) / 4;
    const riskTolerance = riskScore > 0.66? "high": riskScore > 0.33? "medium": "low";
    return {
        // income: formatDollar(profile.income),
        percentIncomeInvested: profile.percentIncomeInvested,
        targetDividendYield: profile.targetYield,
        targetAllocationToInternational: profile.international,
        sectorPreferences: profile.preferences,
        livesIn: "Australia",
        riskTolerance,
    }
}

export async function getStockAdvice(
    args: z.infer<typeof parameters>,
    userId: string,
) {
    /**
     * The following are considered when making recommendation.
     * 1. Overall portfolio risk (as measured by Beta)
     * 2. Target sector allocations.
     * 3. Income of the portfolio.
     * 4. Analyst price targets.
     * 5. Utility of portfolio before and after proposed transaction.
     */
    try {
        console.log(args);
        // if (args.amount === 0) {
        //     // TO DO: handle this
        //     return "What amount in dollars are you looking to invest?";
        // }
        // add '.AX' if exchange is ASX
        let symbol = args.symbol;
        if (args.exchange === 'ASX' && !symbol.endsWith('.AX')) {
            symbol = `${symbol}.AX`;
        }

        // check that stock exists
        const stock = await getStockBySymbol(symbol);

        if (!stock) {
            // TO DO: handle this
            return "Stock not found. Pocket Adviser only covers a limited number of stocks. It is likely we do not cover this one.";
        }

        const holdings = await getHoldingsWithStocks(userId);

        const [utility, profile, analystResearch] = await Promise.all([
            null,
            getProfileByUserId(userId),
            getAnalystResearch(symbol)
        ]);
        
        return {
            stockData: stock,
            analystResearch,
            userProfile: formatProfile(profile),
            comments: {
                income: income({ stock, holdings, amount: args.amount }),
                risk: risk({ stock, holdings, amount: args.amount }),
                sectorAllocation: sectorAllocation({ stock, holdings, amount: args.amount }),
            }
        }
    } catch (e) {
        return null;
    }
}