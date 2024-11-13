import { generateObject, type CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

import { z } from "zod";

import { getNotesByUserID } from "@/utils/crud/notes";

import type { Holding, Profile, Stock } from "@prisma/client";

export const description = "Get a list of trade ideas based on the user's current portfolio and investment profile";

export const parameters = z.object({
    action: z.enum(["deposit", "withdraw", "review"]).default("review").describe("The user may wish to deposit or withdraw from their portfolio, or simply have it reviewed"),
    amount: z.number().optional().default(0).describe("The amount the user intends to deposit or withdraw from their portfolio, if any"),
    // number: z.number().optional().default(10).describe("Number of potential transactions to return"), // is this necessary?
    // filters: z.record(
    //     z.enum(["marketCap", "dividendYield", "peRatio", "epsGrowth", "beta"]),
    //     z.number(),
    // ).optional().describe("Any filters to apply to the stocks to be returned")
});

type PartialHolding = Pick<Holding, 'stockId'|'units'>;

type ResponseObject = {
    profile: Profile
    current_portfolio: PartialHolding[]
    optimal_portfolio: PartialHolding[]
    transactions: PartialHolding[]
    context: Stock[]
}

async function fetchOptimalPortfolio(
    body: {
        amount: number,
    },
    userId: string
) {
    const url = new URL(`${process.env.BACKEND_URL}/optimal-portfolio`);
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

    return await response.json() as ResponseObject;
}

export type FormattedTransaction = {
    stockId: number
    symbol: string
    name: string
    units: number
    price: number
    value: number
    direction: "Buy" | "Sell"
}

function formatProfile(profile: Profile) {
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

function formatResponse(response: ResponseObject, amount: number) {
    // format results for interpretation by AI
    const context: Stock[] = []
    const recommendedTransactions: FormattedTransaction[] = [];
    for (const transaction of response.transactions) {
        // if amount is non-zero, we only want transaction in direction of the deposit/withdrawal
        if (amount !== 0 && Math.sign(transaction.units) !== Math.sign(amount)) continue;
        const data = response.context.find((stock) => stock.id === transaction.stockId);
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
            context.push(data);
        }
    }

    // sort transactions by value
    recommendedTransactions.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    return {
        profile: formatProfile(response.profile),
        currentPortfolio: response.current_portfolio,
        recommendedTransactions,
        context,
    }
}

async function selectTransactions(
    response: ReturnType<typeof formatResponse>,
    conversation: CoreMessage[],
) {
    /**
     * Further refine recommended transactions returned by the above endpoint based on user's profile, portfolio, conversation history
     */

    const { object } = await generateObject({
        model: openai('gpt-4o'),
        system: (
`You are assisting an investment-focused chatbot in selecting a subset of potential transactions for the user.
You will receive a list of potential transactions that have been generated for the user by a portfolio optimisation algorithm. 
Your task is to select up to 5 of the transactions from the list based on the user's profile, portfolio, and conversation history between the chatbot and the user.\n\n
Context:\n\n"""${JSON.stringify(response.context)}"""\n\n
User's investment profile:\n\n"""${JSON.stringify(response.profile)}"""\n\n
User's current portfolio:\n\n"""${JSON.stringify(response.currentPortfolio)}"""`
        ),
        prompt: (
`Potential transactions:\n\n"""${JSON.stringify(response.recommendedTransactions)}"""\n\n
Conversation history:\n\n"""${JSON.stringify(conversation)}"""`
        ),
        schema: z.object({
            symbols: z.string().array().nonempty().max(5).describe("Symbols of selected transactions"),
        })
    });

    return object.symbols.map((symbol) => {
        return response.recommendedTransactions.find((transaction) => transaction.symbol === symbol);
    }).filter((obj) => obj !== undefined);
}

function scaleTransactions(
    selectedTransactions: FormattedTransaction[],
    amount: number
) {
    /**
     * Scale selected transactions up or down to meet the intended overall amount
     */
    if (amount === 0) return selectedTransactions;
    
    const sumSelectedTransactions = selectedTransactions.reduce((sum, transaction) => sum + transaction.value, 0);
    const scalingFactor = Math.abs(amount) / Math.abs(sumSelectedTransactions);
    if (scalingFactor < 0.95 || scalingFactor > 1.05) {
        // scale transactions up or down to meet amount
        const scaledTransactions: FormattedTransaction[] = [];
        for (const transaction of selectedTransactions) {
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
    return selectedTransactions;
}

export async function getRecommendations(
    args: z.infer<typeof parameters>,
    messages: CoreMessage[],
    userId: string
) {
    try {
        const amount = args.action === "withdraw"? -Math.abs(args.amount): args.action === "deposit"? Math.abs(args.amount): 0;
        const response = formatResponse(await fetchOptimalPortfolio({ amount }, userId), amount);
        const selectedTransactions = await selectTransactions(response, messages);
        return {
            profile: response.profile,
            context: response.context,
            transactions: scaleTransactions(selectedTransactions, amount),
        }
    } catch (e) {
        console.error("Error getting recommendations: ", e);
        return null;
    }
}