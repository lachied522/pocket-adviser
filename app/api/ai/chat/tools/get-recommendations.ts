import {
    type CoreMessage,
    generateObject,
    streamText,
} from 'ai';
import { openai } from '@ai-sdk/openai';

import { z } from "zod";

import { formatProfile } from './get-profile';

import type { FormattedTransaction, ResolvedPromise } from '@/types/helpers';
import type { Holding, Profile, Stock } from "@prisma/client";

export const description = "Display a list of recommended transactions based on the user's current portfolio and investment profile";

export const parameters = z.object({
    action: z.enum(["DEPOSIT", "WITHDRAW", "REVIEW"]).default("REVIEW").describe("The user may wish to deposit or withdraw from their portfolio, or simply have it reviewed"),
    amount: z.number().optional().default(0).describe("The amount the user intends to deposit or withdraw from their portfolio, if any"),
    // filters: z.record(
    //     z.enum(["marketCap", "dividendYield", "peRatio", "epsGrowth", "beta"]),
    //     z.number(),
    // ).optional().describe("Any filters to apply to the stocks to be returned")
});

export type GetRecommendationsResponse = ResolvedPromise<ReturnType<typeof getRecommendations>>;

type PartialHolding = Pick<Holding, 'stockId'|'units'>;

type OptimalPortfolioResponse = {
    profile: Profile
    currentPortfolio: PartialHolding[]
    optimalPortfolio: PartialHolding[]
    transactions: PartialHolding[]
    stockData: Stock[]
}

type Statistics = {
    expectedReturn: number
    standardDeviation: number
    sharpeRatio: number | null
    treynorRatio: number | null
    beta: number
    dividendYield: number
    sectorAllocations: { [sector: string]: number }
}

type PortfolioStatisticsResponse = {
    proposedPortfolio: Statistics
    currentPortfolio: Statistics
}

async function makePostRequestToBackend(
    endpoint: string,
    body: object,
    userId: string,
    timeout?: number
) {
    const url = new URL(`${process.env.BACKEND_URL}/${endpoint}`);
    const params = new URLSearchParams();
    if (userId) {
        params.set("userId", userId);
    }
    url.search = params.toString();

    let signal: AbortSignal | null = null;
    let timeoutId: NodeJS.Timeout | null = null;
    if (timeout) {
        const controller = new AbortController();
        timeoutId = setTimeout(() => controller.abort(), 58000);
    }

    const response = await fetch(
        url,
        {
            method: "POST",
            signal,
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
            }
        }
    );

    if (timeoutId) clearTimeout(timeoutId);

    if (!response.ok) {
        throw new Error(await response.json());
    }

    return await response.json();
}

async function fetchOptimalPortfolio(
    body: {
        amount: number,
    },
    userId: string
) {
    function formatResponse(response: OptimalPortfolioResponse) {
        // format results for interpretation by AI
        const recommendedTransactions: FormattedTransaction[] = [];
        for (const transaction of response.transactions) {
            const data = response.stockData.find((stock) => stock.id === transaction.stockId);
            if (data) {
                recommendedTransactions.push({
                    symbol: data.symbol,
                    name: data.name,
                    units: transaction.units,
                    price: data.previousClose ?? 0,
                    value: transaction.units * (data.previousClose ?? 0),
                    direction: transaction.units > 0? "Buy" as const: "Sell" as const,
                    stockId: transaction.stockId,
                });
            }
        }
    
        // sort transactions by value
        recommendedTransactions.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        return {
            profile: formatProfile(response.profile),
            currentPortfolio: response.currentPortfolio,
            stockData: response.stockData,
            recommendedTransactions,
        }
    }

    const response = await makePostRequestToBackend("optimal-portfolio", body, userId) as OptimalPortfolioResponse;

    return formatResponse(response);
}

async function fetchPortfolioStatistics(
    body: {
        transactions: PartialHolding[]
    },
    userId: string
) {
    function formatStatistics(statistics: Statistics) {
        const sectorAllocations: { [sector: string]: string } = {};

        for (const sector in statistics.sectorAllocations) {
            sectorAllocations[sector] = statistics.sectorAllocations[sector].toFixed(4);
        }

        return {
            expectedReturn: statistics.expectedReturn.toFixed(4),
            standardDeviation: statistics.standardDeviation.toFixed(4),
            sharpeRatio: statistics.sharpeRatio?.toFixed(4),
            treynorRatio: statistics.treynorRatio?.toFixed(4),
            beta: statistics.beta.toFixed(4),
            dividendYield: statistics.dividendYield.toFixed(4),
            sectorAllocations,
        }
    }

    const statistics = await makePostRequestToBackend("portfolio-statistics", body, userId) as PortfolioStatisticsResponse;
    return {
        currentPortfolio: formatStatistics(statistics.currentPortfolio),
        proposedPortfolio: formatStatistics(statistics.proposedPortfolio),
    }
}

function filterResponse(
    response: ResolvedPromise<ReturnType<typeof fetchOptimalPortfolio>>,
    args: z.infer<typeof parameters>,
) {
    // if amount is non-zero, we only want transaction in direction of the deposit/withdrawal
    const filteredTransactions: FormattedTransaction[] = [];

    for (const transaction of response.recommendedTransactions) {
        if (args.amount !== 0 && Math.sign(transaction.units) !== Math.sign(args.amount)) continue;
        filteredTransactions.push(transaction)
    }

    return {
        ...response,
        recommendedTransactions: filteredTransactions,
        stockData: response.stockData.filter(
            (stock) => !!filteredTransactions.find((transaction) => transaction.stockId === stock.id)
        ),
    }
}

async function selectTransactions(
    response: ResolvedPromise<ReturnType<typeof fetchOptimalPortfolio>>,
    args: z.infer<typeof parameters>
) {
    /**
     * Further refine recommended transactions returned by the above endpoint based on user's profile, portfolio, conversation history
     */
    const MAX_TRANSACTIONS = 3; // TO DO: add this as a function argument

    if (response.recommendedTransactions.length < 1) {
        return [];
    }

    const { object } = await generateObject({
        model: openai('gpt-4o'),
        system: (
`You are assisting an investment-focused chatbot in selecting a subset of potential transactions for the user.
You will receive a list of potential transactions that have been generated for the user by a portfolio optimisation algorithm. 
Your task is to select ${MAX_TRANSACTIONS} of the transactions from the list based on the user's profile and current portfolio. 
${args.action === "REVIEW"? "Make sure to select an appropriate mix of buy and sell transactions.": ''}\n\n
Stock data:\n\n"""${JSON.stringify(response.stockData)}"""\n\n
User's investment profile:\n\n"""${JSON.stringify(response.profile)}"""\n\n
User's current portfolio:\n\n"""${JSON.stringify(response.currentPortfolio)}"""`
        ),
        prompt: (
`Potential transactions:\n\n"""${JSON.stringify(response.recommendedTransactions)}"""\n\n`
        ),
        schema: z.object({
            symbols: z.string().array().nonempty().max(MAX_TRANSACTIONS).describe("Symbols of selected transactions"),
        })
    });

    const selectedTransactions: FormattedTransaction[] = [];
    for (const symbol of object.symbols) {
        const _transaction = response.recommendedTransactions.find((transaction) => transaction.symbol === symbol);
        if (_transaction) selectedTransactions.push(_transaction);
    }

    return selectedTransactions;
}

function scaleTransactions(
    transactions: FormattedTransaction[],
    target: number,
) {
    const sumSelectedTransactions = transactions.reduce((sum, transaction) => sum + transaction.value, 0);
    const scalingFactor = Math.abs(target) / Math.abs(sumSelectedTransactions);
    if (scalingFactor < 0.95 || scalingFactor > 1.05) {
        // scale transactions up or down to meet amount
        const scaledTransactions: FormattedTransaction[] = [];
        for (const transaction of transactions) {
            const scaledUnits = Math.round(scalingFactor * transaction.units);
            scaledTransactions.push({
                ...transaction,
                units: scaledUnits,
                value: scaledUnits * transaction.price,
            });
        }
    
        // sum is less than 5% below amount, must scale up
        return scaledTransactions;
    }

    // no scaling required
    return transactions;
}

function adjustTransactions(
    transactions: FormattedTransaction[],
    args: z.infer<typeof parameters>,
    number: number = 3
) {
    /**
     * Scale selected transactions up or down to meet the intended overall amount
     */
    if (Math.abs(args.amount) > 0) {
        const scaledTransactions = scaleTransactions(transactions.slice(0, number), args.amount);
        return scaledTransactions.filter((transaction) => Math.abs(transaction.units) > 0);
    }

    // need to balance sells with buys
    // scale buys up or down to meet sells
    const buys: FormattedTransaction[] = [];
    const sells: FormattedTransaction[] = [];
    for (const transaction of transactions) {
        if (transaction.units < 0) {
            sells.push(transaction);
        } else {
            buys.push(transaction);
        }
    }

    if (buys.length === 0 || sells.length === 0) {
        return transactions;
    }

    const sumSells = sells.slice(0, Math.floor(number / 2)).reduce((sum, transaction) => sum + transaction.value, 0);

    const scaledBuys = scaleTransactions(buys.slice(0, number - Math.floor(number / 2)), Math.abs(sumSells));

    return sells.concat(scaledBuys);
}

export async function getRecommendations(
    args: z.infer<typeof parameters>,
    userId: string
) {
    try {
        args = {
            ...args,
            amount: args.action === "WITHDRAW"? -Math.abs(args.amount): args.action === "DEPOSIT"? Math.abs(args.amount): 0,
        }

        const response = filterResponse(await fetchOptimalPortfolio(args, userId), args);

        // LLM will refine recommended transactions
        const selectedTransactions = await selectTransactions(response, args);

        // adjust selected transactions for intended investment amount
        const adjustedTransactions = adjustTransactions(selectedTransactions, args);

        const statistics = await fetchPortfolioStatistics({ transactions: adjustedTransactions }, userId);

        // only return data for stocks included in the selected transactions
        const stockData = response.stockData.filter(
            (stock) => !!adjustedTransactions.find((transaction) => transaction.stockId === stock.id)
        );

        return {
            profile: response.profile,
            transactions: adjustedTransactions,
            statistics,
            stockData,
        }
    } catch (e) {
        if (e instanceof Error)
            console.error(e.message.toString());
        throw e;
    }
}

export async function* handleRecommendations({
    conversation,
    result,
} : {
    conversation: CoreMessage[]
    result: GetRecommendationsResponse
}) {
    if (result.transactions.length < 1) {
        throw new Error("No recommendations were generated");
    }

    const system = (
`You are assisting an investment-focused chatbot in providing a list of recommended transactions for the user. 
You will receive a list of recommended transactions that have been selected for the user based on a portfolio optimisation algorithm and the user's profile. 
Your task is to provide the user with some context for why these transactions are appropriate for them. 
Your response should start with "The above transactions are likely appropriate for you for the following reasons:". 
You should conclude with a precise summary of how these transactions help the user achieve their goals.\n\n
Stock data:\n\n"""${JSON.stringify(result.stockData)}"""\n\n
User's investment profile:\n\n"""${JSON.stringify(result.profile)}"""`
    );

    const prompt = (
`Selected transactions:\n\n"""${JSON.stringify(result.transactions)}"""\n\n
Conversation history:\n\n"""${JSON.stringify(conversation)}"""`
    );

    const { textStream } = await streamText({
        model: openai('gpt-4o'),
        system,
        prompt,
    });

    for await (const text of textStream) {
        yield text;
    }
}