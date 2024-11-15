import { generateObject, streamText, type CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';

import { z } from "zod";

import { formatProfile } from './get-profile';

import type { Holding, Profile, Stock } from "@prisma/client";

export const description = "Get a list of recommended transactions based on the user's current portfolio and investment profile";

export const parameters = z.object({
    action: z.enum(["deposit", "withdraw", "review"]).default("review").describe("The user may wish to deposit or withdraw from their portfolio, or simply have it reviewed"),
    amount: z.number().optional().default(0).describe("The amount the user intends to deposit or withdraw from their portfolio, if any"),
    // filters: z.record(
    //     z.enum(["marketCap", "dividendYield", "peRatio", "epsGrowth", "beta"]),
    //     z.number(),
    // ).optional().describe("Any filters to apply to the stocks to be returned")
});

const MAX_TRANSACTIONS = 3;

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
    args: z.infer<typeof parameters>
) {
    /**
     * Further refine recommended transactions returned by the above endpoint based on user's profile, portfolio, conversation history
     */

    const { object } = await generateObject({
        model: openai('gpt-4o'),
        system: (
`You are assisting an investment-focused chatbot in selecting a subset of potential transactions for the user.
You will receive a list of potential transactions that have been generated for the user by a portfolio optimisation algorithm. 
Your task is to select ${MAX_TRANSACTIONS} of the transactions from the list based on the user's profile, portfolio, and conversation history between the chatbot and the user. 
${args.action === "review"? "Make sure to select an appropriate mix of buy and sell transactions.": ''}\n\n
Context:\n\n"""${JSON.stringify(response.context)}"""\n\n
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
    const response = formatResponse(await fetchOptimalPortfolio({ amount }, userId), amount);
    const selectedTransactions = await selectTransactions(response, messages, args);

    // further refine context to only stocks included in the selected transactions
    const context = response.context.filter((stock) => !!selectedTransactions.find((transaction) => transaction.stockId === stock.id));
    return {
        profile: response.profile,
        transactions: adjustTransactions(selectedTransactions, amount),
        context,
    }
}

export async function* handleRecommendations(
    conversation: CoreMessage[],
    result: {
        profile: any // TO DO: type this properly
        context: Stock[]
        transactions: FormattedTransaction[]
    }
) {
    /**
     * Handle the streaming of the result of the getRecommendations tool.
     * The tool result is already visible to user, so we only want LLM to explain why these were chosen.
     */

    if (result.transactions.length < 1) {
        throw new Error("No recommendations were generated");
    }

    const system = (
`You are assisting an investment-focused chatbot in providing a list of recommended transactions for the user.
You will receive a list of recommended transactions that have been selected for the user based on a portfolio optimisation algorithm and the user's profile. 
Your task is to provide the user with some context for why these transactions are appropriate for them.\n\n
Context:\n\n"""${JSON.stringify(result.context)}"""\n\n
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