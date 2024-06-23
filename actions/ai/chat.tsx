"use server";
import { generateId, streamText, type TextPart, type ToolResultPart, type ToolCallPart, type CoreMessage } from 'ai';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';

import { description as searchWebDescription, parameters as searchWebParams, searchWeb } from './tools/search-web';
import { description as readArticleDescription, parameters as readArticleParams, readArticle } from './tools/read-article';
import { description as getStockDescription, parameters as getStockParams, getStockInfo } from "./tools/get-stock-info";
import { description as getRecommendationsDescription, parameters as getRecommendationsParams, getRecommendations } from './tools/get-recommendations';
import { description as getStockAdviceDescription, parameters as getStockAdviceParams, getStockAdvice } from './tools/get-stock-advice';

import { ChatMessage, LoadingMessage, MessageWithRecommendations, MessageWithStockCard } from './components/messages';

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
    if (article) {
        // push user message to conversation history
        conversationHistory.push({
            role: 'user',
            content: input,
        });
        // read article
        const result = await readArticle(article.url);
        if (!result) {
            // TO DO
        } else {
            const id = generateId();
            const args = { url: article.url };
            // append assistant message
            conversationHistory.push({
                role: 'assistant',
                content: [{ type: 'tool-call', toolCallId: id, toolName: "readArticle", args }]
            });
            // append tool response
            conversationHistory.push({
                role: 'tool',
                content: [{ type: 'tool-result', toolCallId: id, toolName: "readArticle", args, result }]
            });
        }
    } else {
        // push user input to conversation history
        conversationHistory.push({ role: 'user', content: input });
    }

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
            searchWeb: {
                description: searchWebDescription,
                parameters: searchWebParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg="Searching web" />;
                    const res = await searchWeb(args.query, args.date);
                    // add tool to history
                    appendToolCallToHistory("searchWeb", args, JSON.stringify(res), !!res);
                    let content = "";
                    if (res) {
                        // stream text response to chat and update content of message
                        const stream = streamAI(conversationHistory);
                        for await (const text of stream) {
                            content += text;
                            yield <ChatMessage content={content} />;
                        }
                    } else {
                        content = "I'm sorry, I had trouble retrieving any information on that topic.";
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    // commit history
                    commitHistory();
                    return <ChatMessage content={content} />;
                },
            },
            readArticle: {
                description: readArticleDescription,
                parameters: readArticleParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg="Retrieving article" />;
                    const res = await readArticle(args.url);
                    // update history
                    appendToolCallToHistory("readArticle", args, JSON.stringify(res), !!res);
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
            getStockInfo: {
                description: getStockDescription,
                parameters: getStockParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg={`Getting info on ${args.symbol.toUpperCase()}`} />;
                    const stockData = await getStockInfo(args.symbol, args.exchange);
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
                    // commit history
                    commitHistory();
                    return <MessageWithStockCard content={content} stockData={stockData} />;
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
                    let content = "";
                    let stockData: any = null;
                    if (res) {
                        stockData = res.stockData;
                        // stream text response to chat and update content of message
                        const stream = streamAI(conversationHistory);
                        for await (const text of stream) {
                            content += text;
                            yield <MessageWithStockCard content={content} stockData={stockData} />;
                        }
                    } else {
                        content = "I'm sorry, something went wrong. Please try again later.";
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    // commit history
                    commitHistory();
                    return <MessageWithStockCard content={content} stockData={stockData} />;
                },
            },
            getRecommendations: {
                description: getRecommendationsDescription,
                parameters: getRecommendationsParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg="Getting recommendations" />;
                    console.log(args);
                    const res = await getRecommendations(args.target, args.action, userId);
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
                    // commit history
                    commitHistory();
                    return <MessageWithRecommendations content={content} data={res} />;
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