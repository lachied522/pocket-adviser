
import { convertToCoreMessages, streamText, type Message } from 'ai';
import { openai } from '@ai-sdk/openai';

import { description as getRecommendationsDescription, parameters as getRecommendationsParams, getRecommendations } from './tools/get-recommendations';
import { description as getStockAdviceDescription, parameters as getStockAdviceParams, getStockAdvice } from './tools/get-stock-advice';
import { description as getPortfolioDescription, parameters as getPortfolioParams, getPortfolio } from './tools/get-portfolio';
import { description as getProfileDescription, parameters as getProfileParams, getProfile } from './tools/get-profile';
import { description as getStockDescription, parameters as getStockParams, getStockInfo } from './tools/get-stock-info';
import { description as getAnalystResearchDescription, parameters as getAnalystResearchParams, getAnalystResearch } from './tools/get-analyst-research';
import { description as getMarketNewsDescription, parameters as getMarketNewsParams, getMarketNews } from './tools/get-market-news';
import { description as getStockNewsDescription, parameters as getStockNewsParams, getStockNews } from './tools/get-stock-news';
import { description as searchWebDescription, parameters as searchWebParams, searchWeb } from './tools/search-web';
import { description as readUrlDescription, parameters as readUrlParams, readUrl } from './tools/read-url';

import { getSystemMessage } from './system';

const FINISH_STEP = {
    finishReason: "stop",
    usage: {
        promptTokens: 0,
        completionTokens: 0,
    },
    isContinued: false,
}

const FINISH_STREAM = {
    finishReason: "stop",
    usage: {
        promptTokens: 0,
        completionTokens: 0,
    },
}

// TO DO: type this properly
function getAutoResponseForRecommendations(args: any, data: any) {
    if (!data) {
        return "I'm sorry, something went wrong. Is there anything else I can help you with?";
    } 

    if (data.transactions.length === 0) {
        return "It looks like you don't have any recommendations at this time. Is there anything else I can help you with?";
    }

    const numTransactions = data.transactions.length;

    return (
        `Here ${numTransactions > 1? "are": "is"} ${numTransactions} possible trade ${numTransactions > 1? "ideas": "idea"} for your ` +
        `${args.action === "review"? "portfolio": "$" + args.amount.toLocaleString() + (args.action === "withdraw"? "withdrawal": "deposit")}. ` +
        "Please note this is not formal advice. " +
        "Please contact a financial adviser if you require advice, however feel free to ask any questions you may have. 🙂"
    );
}

function getAutoResponseForStockAdvice(args: any, data: any) {
    if (!data) {
        return "I'm sorry, something went wrong. Is there anything else I can help you with?";
    } 

    return "Please contact a financial adviser if you require advice, however feel free to ask any questions you may have. 🙂";
}

export async function* streamAIResponse({
    messages,
    toolName,
    userId,
}: {
    messages: Message[],
    toolName?: "getRecommendations"|"shouldBuyOrSellStock"|"searchWeb",
    userId?: string,
}) {
    const coreMessages = convertToCoreMessages(messages);

    const systemMessage = await getSystemMessage();

    const response = await streamText({
        model: openai('gpt-4o'),
        system: systemMessage,
        messages: coreMessages,
        toolChoice: toolName? { type: 'tool', toolName }: 'auto',
        tools: {
            getRecommendations: {
                description: getRecommendationsDescription,
                parameters: getRecommendationsParams,
                execute: async function (args) {
                    return await getRecommendations(args.amount, args.action, userId);
                },
            },
            shouldBuyOrSellStock: {
                description: getStockAdviceDescription,
                parameters: getStockAdviceParams,
                execute: async function (args) {
                    return await getStockAdvice(args.symbol, args.amount, args.exchange, userId);
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

    // see https://sdk.vercel.ai/docs/ai-sdk-ui/stream-protocol
    for await (const part of response.fullStream) {
        switch (part.type) {
            case 'text-delta': {
                yield `0:${JSON.stringify(part.textDelta)}\n`;
                break;
            }
            case 'tool-call': {
                yield `9:${
                    JSON.stringify({
                        toolCallId: part.toolCallId,
                        toolName: part.toolName,
                        args: part.args,
                    })
                }\n`;
                break;
            }
            case 'tool-call-streaming-start': {
                yield `b:${
                    JSON.stringify({
                        toolCallId: part.toolCallId,
                        toolName: part.toolName,
                    })
                }\n`;
                break;
            }
            case 'tool-call-delta': {
                yield `c:${
                    JSON.stringify({
                        toolCallId: part.toolCallId,
                        toolName: part.toolName,
                        argsTextDelta: part.argsTextDelta,
                    })
                }\n`;
                break;
            }
            case 'tool-result': {
                switch (part.toolName) {
                    case 'getRecommendations': {
                        yield `a:${
                            JSON.stringify({
                                toolCallId: part.toolCallId,
                                result: part.result,
                            })
                        }\n`;
                        // must tell client that tool part is finished
                        yield `e:${JSON.stringify(FINISH_STEP)}\n`;
                        yield `0:${JSON.stringify(getAutoResponseForRecommendations(part.args, part.result))}\n`;
                        yield `d:${JSON.stringify(FINISH_STREAM)}\n`;
                        break;
                    }
                    case 'shouldBuyOrSellStock': {
                        yield `a:${
                            JSON.stringify({
                                toolCallId: part.toolCallId,
                                result: part.result,
                            })
                        }\n`;
                        // must tell client that tool part is finished
                        yield `e:${JSON.stringify(FINISH_STEP)}\n`;
                        yield `0:${JSON.stringify(getAutoResponseForStockAdvice(part.args, part.result))}\n`;
                        yield `d:${JSON.stringify(FINISH_STREAM)}\n`;
                        break;
                    }
                    default: {
                        yield `a:${
                            JSON.stringify({
                                toolCallId: part.toolCallId,
                                result: part.result,
                            })
                        }\n`;
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
                break;
            }
        }
    }
}