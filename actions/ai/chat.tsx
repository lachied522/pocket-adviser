"use server";
import { generateId, streamText, type TextPart, type ToolResultPart, type ToolCallPart, type CoreMessage } from 'ai';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';

import { description as getRecommendationsDescription, parameters as getRecommendationsParams, getRecommendations } from './tools/get-recommendations';
import { description as getStockAdviceDescription, parameters as getStockAdviceParams, getStockAdvice } from './tools/get-stock-advice';
import { description as getPortfolioDescription, parameters as getPortfolioParams, getPortfolio } from './tools/get-portfolio';
import { description as getStockDescription, parameters as getStockParams, getStockInfo } from './tools/get-stock-info';
import { description as searchWebDescription, parameters as searchWebParams, searchWeb } from './tools/search-web';
import { description as readUrlDescription, parameters as readUrlParams, readUrl } from './tools/read-url';

import { checkRateLimits } from './ratelimit';
import { getSystemMessage } from './system';
import { getGreeting } from './greeting';

import { ChatMessage, LoadingMessage, MessageWithStockAdvice, MessageWithRecommendations, MessageWithStockCard, MessageWithWebSearch } from '@/components/adviser/messages';

import type { UserData } from '@/types/helpers';
import type { StockNews } from '@/types/data';

export interface ServerMessage {
    role: 'user'|'assistant'|'tool'
    content: string|Array<TextPart|ToolCallPart>|ToolResultPart
}

export interface ClientMessage {
    id: string
    role: 'user'|'assistant'
    display: React.ReactNode
    article?: StockNews|null
}

const MODEL = openai('gpt-4o');

async function* streamAI(messages: CoreMessage[]) {
    const systemMessage = await getSystemMessage();

    const { textStream } = await streamText({
        model: MODEL,
        system: systemMessage,
        messages,
    });

    for await (const text of textStream) {
        yield text;
    }
}

function AIMessage(display: React.ReactNode) {
    return {
        id: generateId(),
        role: 'assistant' as const,
        display,
    }
}

export async function greetUser({
    user
}: {
    user: UserData|null
}) {
    // greet the user when the page initially loads
    const history = getMutableAIState();
    const greeting = await getGreeting(user);
    // append greeting to history
    history.done([
        { role: 'assistant', content: [{ type: 'text', text: greeting }] },
    ]);
    return AIMessage(<ChatMessage content={greeting} />);
}

export async function clearConversation() {
    const history = getMutableAIState();
    history.done(() => ([]));
}

export async function continueConversation({
    input,
    toolName,
    article,
    user
} : {
    input: string
    toolName?: "getRecommendations"|"shouldBuyOrSellStock"|"getPortfolio"|"getStockInfo"|"searchWeb"|"readUrl" // specify tool to call
    article?: StockNews|null
    user: UserData|null
}): Promise<ClientMessage> {
    "use server";
    // check rate limit
    const [isWithinSlidingLimit, isWithinFixedLimit] = await checkRateLimits(user);
    if (!isWithinSlidingLimit) {
        return AIMessage(<ChatMessage content="Slow down there! You have submitted too many requests, please try again in a couple of seconds. 🏁" />);
    }
    if (!isWithinFixedLimit) {
        return AIMessage(<ChatMessage content="You have reached the maximum number of requests for today. Please try again tomorrow or upgrade to Premium. 🙂" />);
    }
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
        toolName: string,
        args: object,
        result: string,
        isError: boolean = false
    ) {
        const toolCallId = generateId();
        conversationHistory = [
            ...conversationHistory,
            // append assistant message first
            {
                role: 'assistant',
                content: [{ type: 'tool-call', toolCallId, toolName, args }]
            },
            // append tool result
            {
                role: 'tool',
                content: [{ type: 'tool-result', toolCallId, toolName, args, result, isError }]
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
            content: input + `\n\nUrl: ${article.url}`,
        });
        // read article
        const text = await readUrl(article.url);
        // update history
        const args = { url: article.url };
        const res = {
            content: text,
            title: article.title,
        }
        appendToolCallToHistory("readUrl", args, JSON.stringify(res), !!text);
        // prompt AI to get the user's portfolio if portfolio is not already in history
        if (!conversationHistory.find((obj) => (
            obj.role === 'tool' && obj.content[0].toolName === 'getPortfolio'
        ))) {
            toolName = "getPortfolio";
        }
    } else {
        // push user input to conversation history
        conversationHistory.push({ role: 'user', content: input });
    }
    
    const systemMessage = await getSystemMessage();
    const result = await streamUI({
        model: MODEL,
        system: systemMessage,
        messages: conversationHistory,
        initial: <LoadingMessage />,
        toolChoice: toolName? { type: 'tool', toolName }: 'auto',
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
                    yield <LoadingMessage msg="Getting trade ideas" />;
                    const res = await getRecommendations(args.amount, args.action, user?.id);
                    // append tool call to history
                    appendToolCallToHistory("getRecommendations", args, JSON.stringify(res), !!res);
                    let content = "";
                    if (res) {
                        if (res["transactions"] && res["transactions"].length === 0) {
                            content = "It looks like you have no recommendations at this time.";
                        } else {
                            content = "Please note that these are not formal recommendations. Please contact a financial adviser if you require advice, however feel free to ask any questions you may have. 🙂";
                        }
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
                    const res = await getStockAdvice(args.symbol, args.amount, args.exchange, user?.id);
                    // append tool call to history
                    appendToolCallToHistory("shouldBuyOrSellStock", args, JSON.stringify(res), !!res);
                    // stream text response to chat and update content of message
                    let content = "";
                    if (res) {
                        content = "Please note that this is not a formal recommendation. Please contact a financial adviser if you require advice, however feel free to ask any questions you may have. 🙂";
                    } else {
                        content = "I'm sorry, something went wrong. Please try again later.";
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    commitHistory();
                    return <MessageWithStockAdvice content={content} data={res} />;
                },
            },
            getPortfolio: {
                description: getPortfolioDescription,
                parameters: getPortfolioParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg="Getting your portfolio" />;
                    // get user's portfolio
                    const res = await getPortfolio(user?.id);
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
                        yield <MessageWithWebSearch content={content} res={res} />;
                    }
                    // add assistant response to history
                    appendAssistantMessageToHistory(content);
                    // commit history
                    commitHistory();
                    return <MessageWithWebSearch content={content} res={res} />;
                },
            },
            readUrl: {
                description: readUrlDescription,
                parameters: readUrlParams,
                generate: async function* (args) {
                    yield <LoadingMessage msg="Reading url" />;
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
                        content = "I'm sorry, I had trouble accessing that url.";
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

    return AIMessage(result.value);
}

export const AI = createAI<ServerMessage[], ClientMessage[]>({
    actions: {
      continueConversation,
      clearConversation,
      greetUser,
    },
    initialAIState: [],
    initialUIState: [],
});