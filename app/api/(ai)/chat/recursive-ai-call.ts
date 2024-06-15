import OpenAI from "openai";

import { getPortfolio, getPortfolioSchema } from "./tools/get-portfolio";
import { getRecommendations, getRecommendationsSchema } from "./tools/get-recommendations";
import { shouldBuyOrSellStock, shouldBuyOrSellStockSchema } from "./tools/should-buy-or-sell-stock";

// initiliase openai client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const AVAILABLE_TOOLS = {
    getPortfolio,
    getRecommendations,
    shouldBuyOrSellStock,
}

const TOOL_SCHEMAS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
    getPortfolioSchema,
    getRecommendationsSchema,
    shouldBuyOrSellStockSchema,
]

async function callTool(
    functionName: string, 
    functionArgs: {
        [key: string]: any
    },
) {
    if (!(functionName in AVAILABLE_TOOLS)) return "There was an error calling the function";

    try {
        const functionToCall = AVAILABLE_TOOLS[functionName as keyof typeof AVAILABLE_TOOLS];
        const functionArgsArr = Object.values(functionArgs);
        
        /* @ts-ignore:  */
        const result = await functionToCall.apply(null, functionArgsArr);
        console.log(result);
        return JSON.stringify(result);
    } catch (e) {
        console.log(`Error calling function ${functionName}: ${e}`);
        return "There was an error calling the function";
    }
}

interface RecursiveAICallProps {
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]
    model?: string
    userName?: string,
    iteration?: number
    maxIters?: number
}

type RecursiveF = AsyncGenerator<string, void | RecursiveF>;

export default async function* recursiveAICall({
    model,
    messages,
    iteration = 0,
    maxIters = 2,
}: RecursiveAICallProps): RecursiveF {
    try {
        if (iteration > maxIters) {
            // catch any iterations greater than depth of maxIters
            throw new Error('Max iterations.');
        }

        const response = await openai.chat.completions.create({
            model: model || 'gpt-3.5-turbo',
            messages: messages,
            tools: TOOL_SCHEMAS,
            tool_choice: "auto",
            stream: true,
        });
        
        // initiliase array of tool calls
        const tool_calls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[] = [];
        for await (const chunk of response) {
            // check if finished
            if (chunk.choices[0].finish_reason) {
                break;
            }
            
            const delta = chunk.choices[0].delta;
            if (delta.content) {
                yield delta.content;
            }

            // https://community.openai.com/t/has-anyone-managed-to-get-a-tool-call-working-when-stream-true/498867/10
            if (delta.tool_calls) {
                const tool_call = delta.tool_calls[0];
                const index = tool_call.index;
                if (index === tool_calls.length) {
                    // new tool call - push to array
                    tool_calls.push(tool_call as OpenAI.Chat.Completions.ChatCompletionMessageToolCall);
                }
                if (tool_call.id) tool_calls[index].id = tool_call.id;
                if (tool_call.type) tool_calls[index].type = tool_call.type; // always type
                if (tool_call.function) {
                    if (tool_call.function.name) tool_calls[index].function.name = tool_call.function.name;
                    if (tool_call.function.arguments) tool_calls[index].function.arguments += tool_call.function.arguments;
                }
            }
        }
    
        // check if AI wishes to call tool
        if (process.env.NODE_ENV==="development") console.log(tool_calls);
        if (tool_calls.length > 0) {
            // push previous assistant message to 'messages' array
            messages.push({
                role: "assistant",
                content: null,
                tool_calls,
            });

            await Promise.all(tool_calls.map(async (tool_call) => {
                const functionName = tool_call.function.name;
                const functionArgs = JSON.parse(tool_call.function.arguments);
                const functionResponse = await callTool(functionName, functionArgs);
    
                messages.push({
                    role: "tool",
                    tool_call_id: tool_call.id,
                    content: functionResponse,
                });
            }));
    
            const response = recursiveAICall({
                model,
                messages,
                iteration: iteration + 1,
                maxIters,
            });
            
            for await (const content of response) {
                yield content;
            }
        } else {
            yield `!finish:end`;
        }
    } catch (e: any) {
        yield `!finish:{e}`;
    }
}