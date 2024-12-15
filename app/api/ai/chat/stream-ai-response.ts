import { 
    type ToolCallPart,
    type ToolResultPart,
    type CoreMessage,
    type FinishReason,
    type LanguageModelUsage,
    streamText,
} from 'ai';
import { openai } from '@ai-sdk/openai';

import { description as getRecommendationsDescription, parameters as getRecommendationsParams, getRecommendations, handleRecommendations } from './tools/get-recommendations';
import { description as getPortfolioDescription, parameters as getPortfolioParams, getPortfolio } from './tools/get-portfolio';
import { description as getProfileDescription, parameters as getProfileParams, getProfile } from './tools/get-profile';
import { description as getStockDescription, parameters as getStockParams, getStockInfo } from './tools/get-stock-info';
import { description as getAnalystResearchDescription, parameters as getAnalystResearchParams, getAnalystResearch } from './tools/get-analyst-research';
import { description as getMarketNewsDescription, parameters as getMarketNewsParams, getMarketNews } from './tools/get-market-news';
import { description as getStockNewsDescription, parameters as getStockNewsParams, getStockNews } from './tools/get-stock-news';
import { description as searchWebDescription, parameters as searchWebParams, searchWeb } from './tools/search-web';
import { description as readUrlDescription, parameters as readUrlParams, readUrl } from './tools/read-url';

import { getSystemMessage } from '../system';

export type ToolName = "getRecommendations" | "getPortfolio" | "getProfile" | "getStockInfo" | "getMarketNews" | "getStockNews" | "getAnalystResearch" | "searchWeb" | "readUrl";

function getFinishStep(finishReason: "stop"|"tool-calls"|"error") {
    return {
        finishReason,
        usage: {
            promptTokens: 0,
            completionTokens: 0,
        },
        isContinued: false,
    }
}

function getFinishStream(finishReason: "stop"|"tool-calls"|"error") {
    return {
        finishReason,
        usage: {
            promptTokens: 0,
            completionTokens: 0,
        },
    }
}

export async function* streamAIResponse({
    messages,
    toolName,
    userId,
    accountType,
    onFinish
}: {
    messages: CoreMessage[]
    toolName?: ToolName
    userId: string
    accountType: "GUEST"|"FREE"|"PAID"|"ADMIN"
    onFinish: ({
        text,
        finishReason,
        // usage,
        // responseMessages,
        toolCalls,
        toolResults,
    } : {
        text: string
        // usage: LanguageModelUsage
        finishReason: FinishReason
        // responseMessages: CoreMessage[]
        toolCalls: ToolCallPart[]
        toolResults: ToolResultPart[]
    }) => void
}) {
    const systemMessage = await getSystemMessage(userId, accountType);
    const response = await streamText({
        model: openai('gpt-4o'),
        system: systemMessage,
        messages,
        toolChoice: toolName? { type: 'tool', toolName }: 'auto',
        tools: {
            getRecommendations: {
                description: getRecommendationsDescription,
                parameters: getRecommendationsParams,
                execute: async function (args) {
                    return await getRecommendations(args, userId);
                },
            },
            getPortfolio: {
                description: getPortfolioDescription,
                parameters: getPortfolioParams,
                execute: async function () {
                    return await getPortfolio(userId);
                }
            },
            getProfile: {
                description: getProfileDescription,
                parameters: getProfileParams,
                execute: async function () {
                    return await getProfile(userId);
                },
            },
            getStockInfo: {
                description: getStockDescription,
                parameters: getStockParams,
                execute: async function (args) {
                    return await getStockInfo(args.symbol, args.exchange);
                },
            },
            getMarketNews: {
                description: getMarketNewsDescription,
                parameters: getMarketNewsParams,
                execute: async function (args) {
                    return await getMarketNews(args.query, args.days);
                },
            },
            getStockNews: {
                description: getStockNewsDescription,
                parameters: getStockNewsParams,
                execute: async function (args) {
                    return await getStockNews(args.symbol, args.name, args.days);
                },
            },
            getAnalystResearch: {
                description: getAnalystResearchDescription,
                parameters: getAnalystResearchParams,
                execute: async function (args) {
                    return await getAnalystResearch(args.symbol, args.name, args.exchange)
                }
            },
            searchWeb: {
                description: searchWebDescription,
                parameters: searchWebParams,
                execute: async function (args) {
                    return await searchWeb(args.query);
                },
            },
            readUrl: {
                description: readUrlDescription,
                parameters: readUrlParams,
                execute: async function (args) {
                    return await readUrl(args.url);
                },
            },
        },
    });

    let finishedText = '';
    let finishReason: FinishReason = "stop";
    let toolCalls: ToolCallPart[] = [];
    let toolResults: ToolResultPart[] = [];
    // see https://sdk.vercel.ai/docs/ai-sdk-ui/stream-protocol
    for await (const part of response.fullStream) {
        switch (part.type) {
            case 'text-delta': {
                yield `0:${JSON.stringify(part.textDelta)}\n`;
                finishedText += part.textDelta;
                break;
            }
            case 'tool-call': {
                yield `9:${JSON.stringify(part)}\n`;
                toolCalls.push(part);
                break;
            }
            case 'tool-call-streaming-start': {
                yield `b:${JSON.stringify(part)}\n`;
                break;
            }
            case 'tool-call-delta': {
                yield `c:${JSON.stringify(part)}\n`;
                break;
            }
            case 'tool-result': {
                switch (part.toolName) {
                    case 'getRecommendations': {
                        try {
                            if (!part.result) {
                                throw new Error("Something went wrong");
                            }
                            // yield the selected transactions
                            yield `a:${JSON.stringify(part)}\n`;
                            toolResults.push(part);
                            // tell client that tool part is finished
                            yield `e:${JSON.stringify(getFinishStep("tool-calls"))}\n`;

                            const subStream = handleRecommendations({
                                conversation: messages, 
                                result: part.result,
                            });

                            for await (const subPart of subStream) {
                                yield `0:${JSON.stringify(subPart)}\n`;
                                finishedText += subPart;
                            }

                            yield `e:${JSON.stringify(getFinishStep("stop"))}\n`;
                            yield `d:${JSON.stringify(getFinishStream("stop"))}\n`;
                        } catch (e) {
                            console.error(e);
                            yield `a:${
                                JSON.stringify({
                                    toolCallId: part.toolCallId,
                                    result: "Something went wrong",
                                })
                            }\n`;
                            yield `e:${JSON.stringify(getFinishStep("tool-calls"))}\n`;
                        }

                        break;
                    }
                    default: {
                        yield `a:${JSON.stringify(part)}\n`;
                        toolResults.push(part);
                    }
                }
                break;
            }
            case 'error': {
                yield `3:${part.error}\n`;
                break;
            }
            case 'finish': {
                yield `d:${
                    JSON.stringify({
                        finishReason: part.finishReason,
                        usage: part.usage,
                    })
                }\n`;
                finishReason = part.finishReason;
                break;
            }
        }
    }

    onFinish({
        text: finishedText,
        toolCalls,
        toolResults,
        finishReason,
    });
}