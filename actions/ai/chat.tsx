"use server";
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { generateId, type TextPart, type ToolResultPart, type ToolCallPart } from 'ai';

import { ChatMessage, LoadingMessage } from './components/messages';

import { description as getStockDescription, parameters as getStockParams, getStockInfo } from "./tools/get-stock-info";
import { description as getRecommendationsDescription, parameters as getRecommendationsParams, getRecommendations } from './tools/get-recommendations';

import StockCard from './components/stock-card';
import RecommendationsTable from './components/recommendations-table';

export interface ServerMessage {
    role: 'user'|'assistant'|'tool'
    content: string|Array<TextPart|ToolCallPart>|ToolResultPart
}
  
export interface ClientMessage {
    id: string
    role: 'user'|'assistant'
    display: React.ReactNode
}

const SYSTEM_MESSAGE = (
    `You are an investment advisor working for Pocket Adviser. You are assiting the user with their investments in the stock market. ` +
    `Where you cannot answer the user's query, you can recommend the user contact a financial adviser to assist them.`
)

export async function continueConversation(
    input: string,
): Promise<ClientMessage> {
    "use server";
    // see https://sdk.vercel.ai/examples/next-app/interface/route-components
    const history = getMutableAIState();

    function appendAssistantMessageToHistory(text: string) {
        history.done((messages: ServerMessage[]) => [
            ...messages,
            { role: 'assistant', content: [{ type: 'text', text }] },
        ]);
    }

    function appendToolCallToHistory(name: string, args: object, result: string) {
        const id = generateId();
       
        history.done((messages: ServerMessage[]) => [
            ...messages,
            { role: 'assistant', content: [{ type: 'tool-call', toolCallId: id, toolName: name, args }], },  // append 'assistant' message
            { role: 'tool', content: [{ type: 'tool-result', toolCallId: id, toolName: name, args, result }] }, // append 'tool' message
        ]);
    }

    const result = await streamUI({
        model: openai('gpt-4o'),
        system: SYSTEM_MESSAGE,
        messages: [...history.get(), { role: 'user', content: input }],
        initial: <LoadingMessage />,
        text: ({ content, done }) => {
            if (done) {
                appendAssistantMessageToHistory(content);
            }
            return <ChatMessage>{content}</ChatMessage>
        },
        tools: {
            getStockInfo: {
                description: getStockDescription,
                parameters: getStockParams,
                generate: async function* (args) {
                    yield <LoadingMessage />;
                    const stockData = await getStockInfo(args.symbol, args.exchange);
                    // append tool call to history
                    if (!stockData) {
                        const content = "I'm sorry, I couldn't find any information on that stock.";
                        appendAssistantMessageToHistory(content);
                        return <ChatMessage>{content}</ChatMessage>
                    }
                    // update history before returning
                    appendToolCallToHistory("getStockInfo", args, JSON.stringify(stockData));
                    return <StockCard stockData={stockData} />;
                },
            },
            getRecommendations: {
                description: getRecommendationsDescription,
                parameters: getRecommendationsParams,
                generate: async function* (args) {
                    yield <LoadingMessage />;
                    try {
                        const data = await getRecommendations(args.target, args.action);
                        // update history before returning
                        appendToolCallToHistory("getRecommendations", args, JSON.stringify(data));
                        return <RecommendationsTable data={data} />;
                    } catch (e) {
                        // TO DO
                    }
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
    },
    initialAIState: [],
    initialUIState: [],
});