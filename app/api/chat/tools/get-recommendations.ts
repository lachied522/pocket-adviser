import {
    type CoreMessage,
    generateObject,
    streamText,
} from 'ai';
import { openai } from '@ai-sdk/openai';

import { z } from "zod";

import { formatProfile } from './get-profile';

import type { Holding, Profile, Stock } from "@prisma/client";
import type { ResolvedPromise } from '@/types/helpers';

export const description = "Get a list of recommended transactions based on the user's current portfolio and investment profile";

export const parameters = z.object({
    action: z.enum(["deposit", "withdraw", "review"]).default("review").describe("The user may wish to deposit or withdraw from their portfolio, or simply have it reviewed"),
    amount: z.number().optional().default(0).describe("The amount the user intends to deposit or withdraw from their portfolio, if any"),
    // filters: z.record(
    //     z.enum(["marketCap", "dividendYield", "peRatio", "epsGrowth", "beta"]),
    //     z.number(),
    // ).optional().describe("Any filters to apply to the stocks to be returned")
});

export type GetRecommendationsResponse = ResolvedPromise<ReturnType<typeof getRecommendations>>;

type FormattedTransaction = {
    stockId: number
    symbol: string
    name: string
    units: number
    price: number
    value: number
    direction: "Buy" | "Sell"
}

type PartialHolding = Pick<Holding, 'stockId'|'units'>;

type OptimalPortfolioResponse = {
    profile: Profile
    current_portfolio: PartialHolding[]
    optimal_portfolio: PartialHolding[]
    transactions: PartialHolding[]
    stock_data: Stock[]
}

type Statistics = {
    expected_return: number
    standard_deviation: number
    sharpe_ratio: number
    treynor_ratio: number
    beta: number
    dividend_yield: number
    sector_allocations: { [sector: string]: number }
}

type PortfolioStatisticsResponse = {
    proposed_portfolio: Statistics
    current_portfolio: Statistics
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

    // Clear the timeout if the request completes in time
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
        const stockData: Stock[] = []
        const recommendedTransactions: FormattedTransaction[] = [];
        for (const transaction of response.transactions) {
            const data = response.stock_data.find((stock) => stock.id === transaction.stockId);
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
                stockData.push(data);
            }
        }
    
        // sort transactions by value
        recommendedTransactions.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        return {
            profile: formatProfile(response.profile),
            currentPortfolio: response.current_portfolio,
            recommendedTransactions,
            stockData,
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
    
        for (const sector in statistics.sector_allocations) {
            sectorAllocations[sector] = statistics.sector_allocations[sector].toFixed(2);
        }
    
        return {
            expectedReturn: statistics.expected_return,
            standardDeviation: statistics.standard_deviation,
            sharpeRatio: statistics.sharpe_ratio,
            treynorRatio: statistics.treynor_ratio,
            beta: statistics.beta,
            dividendYield: statistics.dividend_yield,
            sectorAllocations,
        }
    }

    const statistics = await makePostRequestToBackend("portfolio-statistics", body, userId) as PortfolioStatisticsResponse;
    return {
        currentPortfolio: formatStatistics(statistics.current_portfolio),
        proposedPortfolio: formatStatistics(statistics.proposed_portfolio),
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
    conversation: CoreMessage[],
    args: z.infer<typeof parameters>
) {
    /**
     * Further refine recommended transactions returned by the above endpoint based on user's profile, portfolio, conversation history
     */
    const MAX_TRANSACTIONS = 3; // TO DO: add this as a function argument

    const { object } = await generateObject({
        model: openai('gpt-4o'),
        system: (
`You are assisting an investment-focused chatbot in selecting a subset of potential transactions for the user.
You will receive a list of potential transactions that have been generated for the user by a portfolio optimisation algorithm. 
Your task is to select ${MAX_TRANSACTIONS} of the transactions from the list based on the user's profile, portfolio, and conversation history between the chatbot and the user. 
${args.action === "review"? "Make sure to select an appropriate mix of buy and sell transactions.": ''}\n\n
Stock data:\n\n"""${JSON.stringify(response.stockData)}"""\n\n
User's investment profile:\n\n"""${JSON.stringify(response.profile)}"""\n\n
User's current portfolio:\n\n"""${JSON.stringify(response.currentPortfolio)}"""`
        ),
        prompt: (
`Potential transactions:\n\n"""${JSON.stringify(response.recommendedTransactions)}"""\n\n
Conversation history:\n\n"""${JSON.stringify(conversation)}"""`
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
    target: number,
    number: number = 3
) {
    /**
     * Scale selected transactions up or down to meet the intended overall amount
     */
    if (target === 0) {
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
    
    return scaleTransactions(transactions.slice(0, number), target);
}

export async function getRecommendations(
    args: z.infer<typeof parameters>,
    messages: CoreMessage[],
    userId: string
) {
    const amount = args.action === "withdraw"? -Math.abs(args.amount): args.action === "deposit"? Math.abs(args.amount): 0;
    const response = filterResponse(await fetchOptimalPortfolio({ amount }, userId), args);

    // LLM will refine recommended transactions
    const selectedTransactions = await selectTransactions(response, messages, args);

    // adjust selected transactions for intended investment amount
    const adjustedTransactions = adjustTransactions(selectedTransactions, amount);

    const statistics = await fetchPortfolioStatistics({ transactions: adjustedTransactions }, userId);

    return {
        profile: response.profile,
        transactions: adjustedTransactions,
        statistics,
        // only return data for stocks included in the selected transactions
        stockData: response.stockData.filter(
            (stock) => !!selectedTransactions.find((transaction) => transaction.stockId === stock.id)
        ),
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