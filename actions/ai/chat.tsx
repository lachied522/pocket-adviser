"use server";
import { generateId, streamText, type TextPart, type ToolResultPart, type ToolCallPart, type CoreMessage } from 'ai';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';

import { description as getRecommendationsDescription, parameters as getRecommendationsParams, getRecommendations } from './tools/get-recommendations';
import { description as getStockAdviceDescription, parameters as getStockAdviceParams, getStockAdvice } from './tools/get-stock-advice';
import { description as getPortfolioDescription, parameters as getPortfolioParams, getPortfolio } from "./tools/get-portfolio";
import { description as getStockDescription, parameters as getStockParams, getStockInfo } from "./tools/get-stock-info";
import { description as searchWebDescription, parameters as searchWebParams, searchWeb } from './tools/search-web';
import { description as readUrlDescription, parameters as readUrlParams, readUrl } from './tools/read-url';

import { ChatMessage, LoadingMessage, MessageWithRecommendations, MessageWithStockCard } from '@/components/adviser/messages';

import type { StockNews } from '@/types/api';

export interface ServerMessage {
    role: 'user'|'assistant'|'tool'
    content: string|Array<TextPart|ToolCallPart>|ToolResultPart
}

export interface ClientMessage {
    id: string
    role: 'user'|'assistant'
    display: React.ReactNode
}

function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm: string|number = today.getMonth() + 1; // Months start at 0!
    let dd: string|number = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return dd + '/' + mm + '/' + yyyy;
}

const MODEL = openai('gpt-4-turbo');

const SYSTEM_MESSAGE = (
    `You are an enthusiastic investment advisor working for Pocket Adviser. You are assiting the user with their investments in the stock market. ` +
    `Stock indexes advanced this week, with the S&P 500 up 0.8% and the Nasdaq up 1%, both setting new record highs. The Dow also moved up 0.5%. However, the S&P 500 ticked lower on Friday due to shares of market bellwether Nvidia slipping for a second day. Additionally, Wall Street experienced a roller-coaster ride following a massive expiration of options, leaving traders more cautious.` +
    `Where you cannot answer the user's query, you can recommend the user contact a financial adviser to assist them. ` +
    `Feel free to use emojis in your messages. ` +
    `Today's date is ${getTodayDate()}. `
)

async function* streamAI(messages: CoreMessage[]) {
    const { textStream } = await streamText({
        model: MODEL,
        system: SYSTEM_MESSAGE,
        messages,
    });

    for await (const text of textStream) {
        yield text;
    }
}

export async function clearConversation() {
    const history = getMutableAIState();
    history.done(() => ([]));
}

export async function continueConversation({
    input,
    userId,
    article,
} : {
    input: string,
    userId?: string|null,
    article?: StockNews
}): Promise<ClientMessage> {
    "use server";
    // see https://sdk.vercel.ai/examples/next-app/interface/route-components
    const history = getMutableAIState();

    // create copy of conversation history
    let conversationHistory = [
        ...history.get(),
    ];

    function appendAssistantMessageToHistory(text: string) {
        conversationHistory = [
            ...conversationHistory,
            { role: 'assistant', content: [{ type: 'text', text }] },
        ];
    }

    function appendToolCallToHistory(
        name: string,
        args: object,
        result: string,
        isError: boolean = false
    ) {
        const id = generateId();
        conversationHistory = [
            ...conversationHistory,
            // append assistant message first
            {
                role: 'assistant',
                content: [{ type: 'tool-call', toolCallId: id, toolName: name, args }]
            },
            // append tool result
            {
                role: 'tool',
                content: [{ type: 'tool-result', toolCallId: id, toolName: name, args, result, isError }]
            },
        ];
    }

    function commitHistory() {
        history.done(conversationHistory);
    }

    // if article exists, read article before and append to conversation history
    // if (article) {
    //     // push user message to conversation history
    //     conversationHistory.push({
    //         role: 'user',
    //         content: input,
    //     });
    //     // read article
    //     const result = await readUrl(article.url);
    //     if (!result) {
    //         // TO DO
    //     } else {
    //         const id = generateId();
    //         const args = { url: article.url };
    //         // append assistant message
    //         conversationHistory.push({
    //             role: 'assistant',
    //             content: [{ type: 'tool-call', toolCallId: id, toolName: "readUrl", args }]
    //         });
    //         // append tool response
    //         conversationHistory.push({
    //             role: 'tool',
    //             content: [{ type: 'tool-result', toolCallId: id, toolName: "readUrl", args, result }]
    //         });
    //     }
    // } else {
    //     // push user input to conversation history
    //     conversationHistory.push({ role: 'user', content: input });
    // }

    conversationHistory.push({ role: 'user', content: input });

    const result = await streamUI({
        model: MODEL,
        system: SYSTEM_MESSAGE,
        messages: conversationHistory,
        initial: <LoadingMessage />,
        text: ({ content, done }) => {
            if (done) {
                appendAssistantMessageToHistory(content);
                commitHistory();
            }
            return <ChatMessage content={content} />
        },
        tools: {
            getRecommendations: {
                description: getRecommendationsDescription,
                parameters: getRecommendationsParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg="Getting recommendations" />;
                    const res = await getRecommendations(args.amount, args.action, userId);
                    // append tool call to history
                    appendToolCallToHistory("getRecommendations", args, JSON.stringify(res), !!res);
                    let content = "";
                    if (res) {
                        // stream text response to chat and update content of message
                       content = "Please note that these are not formal recommendations. Please contact a financial adviser if you require advice, however feel free to ask any questions you may have."
                    } else {
                        content = "I'm sorry, something went wrong. Please try again later.";
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    commitHistory();
                    return <MessageWithRecommendations content={content} data={res} />;
                },
            },
            shouldBuyOrSellStock: {
                description: getStockAdviceDescription,
                parameters: getStockAdviceParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg={`Getting info on ${args.symbol.toUpperCase()}`} />;
                    // get stock advice
                    const res = await getStockAdvice(args.symbol, args.amount, args.exchange, userId);
                    // append tool call to history
                    appendToolCallToHistory("shouldBuyOrSellStock", args, JSON.stringify(res), !!res);
                    const stockData = res? res.stockData: null;
                    // stream text response to chat and update content of message
                    let content = "";
                    const stream = streamAI(conversationHistory);
                    for await (const text of stream) {
                        content += text;
                        yield <MessageWithStockCard content={content} stockData={stockData} />;
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    commitHistory();
                    return <MessageWithStockCard content={content} stockData={stockData} />;
                },
            },
            getPortfolio: {
                description: getPortfolioDescription,
                parameters: getPortfolioParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg="Getting your portfolio" />;
                    // get user's portfolio
                    const res = await getPortfolio(userId);
                    appendToolCallToHistory("getPortfolio", args, JSON.stringify(res), !!res);
                    // stream text response
                    let content = "";
                    const stream = streamAI(conversationHistory);
                    for await (const text of stream) {
                        content += text;
                        yield <ChatMessage content={content} />;
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    // commit history
                    commitHistory();
                    return <ChatMessage content={content} />;
                }
            },
            getStockInfo: {
                description: getStockDescription,
                parameters: getStockParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg={`Getting info on ${args.symbol.toUpperCase()}`} />;
                    const stockData = await getStockInfo(args.symbol, args.exchange, args.includeAnalystResearch);
                    // append tool call to history
                    appendToolCallToHistory("getStockInfo", args, JSON.stringify(stockData), !!stockData);
                    let content = "";
                    if (stockData) {
                        // stream text response to chat and update content of message
                        const stream = streamAI(conversationHistory);
                        for await (const text of stream) {
                            content += text;
                            yield <MessageWithStockCard content={content} stockData={stockData} />;
                        }
                    } else {
                        content = "I'm sorry, I couldn't find any information on that stock.";
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    commitHistory();
                    return <MessageWithStockCard content={content} stockData={stockData} />;
                },
            },
            searchWeb: {
                description: searchWebDescription,
                parameters: searchWebParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg="Searching web" />;
                    const res = await searchWeb(args.query, args.date);
                    // add tool to history
                    appendToolCallToHistory("searchWeb", args, JSON.stringify(res), !!res);
                    // stream text response to chat and update content of message
                    let content = "";
                    const stream = streamAI(conversationHistory);
                    for await (const text of stream) {
                        content += text;
                        yield <ChatMessage content={content} />;
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    // commit history
                    commitHistory();
                    return <ChatMessage content={content} />;
                },
            },
            readUrl: {
                description: readUrlDescription,
                parameters: readUrlParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg="Reading web page" />;
                    const res = await readUrl(args.url);
                    // update history
                    appendToolCallToHistory("readUrl", args, JSON.stringify(res), !!res);
                    let content = "";
                    if (res) {
                        // stream text response to chat and update content of message
                        const stream = streamAI(conversationHistory);
                        for await (const text of stream) {
                            content += text;
                            yield <ChatMessage content={content} />;
                        }
                    } else {
                        content = "I'm sorry, I couldn't access that article.";
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    // commit history
                    commitHistory();
                    return <ChatMessage content={content} />;
                },
            },
        },
    });

    return {
        id: generateId(),
        role: 'assistant',
        display: result.value,
    };
}

export const AIProvider = createAI<ServerMessage[], ClientMessage[]>({
    actions: {
      continueConversation,
      clearConversation,
    },
    initialAIState: [],
    initialUIState: [],
});