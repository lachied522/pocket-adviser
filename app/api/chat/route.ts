"use server";
import { NextResponse, type NextRequest } from 'next/server';
import { generateId, convertToCoreMessages, streamText, type Message } from 'ai';
import { openai } from '@ai-sdk/openai';

import { description as getRecommendationsDescription, parameters as getRecommendationsParams, getRecommendations } from './tools/get-recommendations';
import { description as getStockAdviceDescription, parameters as getStockAdviceParams, getStockAdvice } from './tools/get-stock-advice';
import { description as getPortfolioDescription, parameters as getPortfolioParams, getPortfolio } from './tools/get-portfolio';
import { description as getStockDescription, parameters as getStockParams, getStockInfo } from './tools/get-stock-info';
import { description as getMarketNewsDescription, parameters as getMarketNewsParams, getMarketNews } from './tools/get-market-news';
import { description as getStockNewsDescription, parameters as getStockNewsParams, getStockNews } from './tools/get-stock-news';
import { description as searchWebDescription, parameters as searchWebParams, searchWeb } from './tools/search-web';
import { description as readUrlDescription, parameters as readUrlParams, readUrl } from './tools/read-url';

import { checkRateLimits } from './ratelimit';
import { getSystemMessage } from './system';

import { recursiveTextStream } from './recursive-text-stream';

export async function POST(request: NextRequest) {
    const { messages, article, toolName, userId } = await request.json();

    // check rate limit
    // const rateLimitMessage = await checkRateLimits(user);
    // if (rateLimitMessage) {
    //     return rateLimitMessage;
    // }

    if (article) {
        messages[messages.length - 1].content =
        messages[messages.length - 1].content +
        `\n\nArticle:${JSON.stringify(article)}`;
    }

    const response = recursiveTextStream(messages, toolName, userId);

    // const response = await streamText({
    //     model: openai('gpt-4o'),
    //     system: systemMessage,
    //     messages: coreMessages,
    //     toolChoice: toolName? { type: 'tool', toolName }: 'auto',
    //     tools: {
    //         getRecommendations: {
    //             description: getRecommendationsDescription,
    //             parameters: getRecommendationsParams,
    //             execute: async function (args) {
    //                 return await getRecommendations(args.amount, args.action, userId);
    //             },
    //         },
    //         shouldBuyOrSellStock: {
    //             description: getStockAdviceDescription,
    //             parameters: getStockAdviceParams,
    //             execute: async function (args) {
    //                 return await getStockAdvice(args.symbol, args.amount, args.exchange, userId);
    //             },
    //         },
    //         getPortfolio: {
    //             description: getPortfolioDescription,
    //             parameters: getPortfolioParams,
    //             execute: async function () {
    //                 return await getPortfolio(userId);
    //             }
    //         },
    //         getStockInfo: {
    //             description: getStockDescription,
    //             parameters: getStockParams,
    //             execute: async function (args) {
    //                 return await getStockInfo(args.symbol, args.exchange, args.includeAnalystResearch);
    //             },
    //         },
    //         searchWeb: {
    //             description: searchWebDescription,
    //             parameters: searchWebParams,
    //             execute: async function (args) {
    //                 return await searchWeb(args.query, args.date);
    //             },
    //         },
    //         readUrl: {
    //             description: readUrlDescription,
    //             parameters: readUrlParams,
    //             execute: async function (args) {
    //                 return await readUrl(args.url);
    //             },
    //         },
    //     },
    // });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();

            for await (const content of response) {
                const queue = encoder.encode(content);
                controller.enqueue(queue);
            }
   
            controller.close();
        }
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8"
        },
        status: 200
    });
}