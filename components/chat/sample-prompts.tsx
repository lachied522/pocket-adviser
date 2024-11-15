"use client";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

import { type ChatState, useChatContext } from "@/context/ChatContext";

const SAMPLE_PROMPTS = [
    {
        input: "Should I buy shares in AAPL?",
    },
    {
        input: "Should I invest in NVDA?",
    },
    {
        input: "What can I invest in with $100?",
        tool: "getRecommendations",
    },
    {
        input: "What are the best dividend stocks?",
        tool: "searchWeb",
    },
    {
        input: "Should I invest more in ETFs?",
    },
    {
        input: "Why is the market up/down today?",
        tool: "searchWeb",
    },
    {
        input: "What does 'EPS' mean?",
    },
    {
        input: "What's happening in the market?",
        tool: "searchWeb",
    },
    {
        input: "What is value investing?",
    },
    {
        input: "What is the PE ratio?",
    },
    {
        input: "What stocks are on the move?",
        tool: "searchWeb",
    },
    {
        input: "How does inflation impact my portfolio?",
        tool: "getPortfolio",
    },
    {
        input: "What is diversification?",
    },
    {
        input: "Should I diversify my portfolio?",
        tool: "getPortfolio",
    },
    {
        input: "What does Beta mean?",
    },
    {
        input: "What is BHP's dividend yield?",
        tool: "getStockInfo"
    },
] as const;

export default function SamplePrompts() {
    const { onSubmit } = useChatContext() as ChatState;
    const [samplePrompts, setSamplePrompts] = useState<typeof SAMPLE_PROMPTS[number][]>([]);

    useEffect(() => {
        const samples: typeof SAMPLE_PROMPTS[number][] = [];
        while (samples.length < 3) {
            const sample = SAMPLE_PROMPTS[Math.round(Math.random() * (SAMPLE_PROMPTS.length - 1))];
            if (!samples.includes(sample)) {
                samples.push(sample);
            }
        }
        setSamplePrompts(samples);
    }, []);

    return (
        <div className="w-full hidden sm:flex flex-wrap sm:justify-center gap-2 pb-1 sm:pb-0 overflow-x-scroll sm:overflow-hidden p-6">
            {samplePrompts.map((prompt) => (
            <Button
                key={`sample-prompt-${prompt.input}`}
                variant='outline'
                onClick={() => onSubmit(prompt.input, 'tool' in prompt? prompt.tool: undefined)}
                className='hover:scale-[1.02] transition-transform duration-150'
            >
                {prompt.input}
            </Button>
            ))}
        </div>
    )
}