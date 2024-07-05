"use client";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const SAMPLE_PROMPTS = [
    "Should I buy shares in AAPL?",
    "Should I invest in NVDA?",
    "What can I invest in with $100?",
    "What are the best dividend stocks?",
    "Should I invest more in ETFs?",
    "Why is the market up/down today?",
    "What does 'EPS' mean?",
    "What's happening in the market?",
    "What is value investing?",
    "What is the PE ratio?",
    "What stocks are on the move?",
    "How does inflation impact my portfolio?",
    "What is diversification?",
    "Should I diversify my portfolio?",
    "What does Beta mean?",
    "What is BHP's dividend yield?"
] as const;

interface SamplePromptsProps {
    setInput: (prompt: string) => void
}

export default function SamplePrompts({ setInput }: SamplePromptsProps) {
    const [samplePrompts, setSamplePrompts] = useState<typeof SAMPLE_PROMPTS[number][]>([]);

    useEffect(() => {
        const samples: typeof SAMPLE_PROMPTS[number][] = [];
        while (samples.length < 4) {
            const sample = SAMPLE_PROMPTS[Math.round(Math.random() * (SAMPLE_PROMPTS.length - 1))];
            if (!samples.includes(sample)) {
                samples.push(sample);
            }
        }
        setSamplePrompts(samples);
    }, []);

    return (
        <div className="w-full flex flex-wrap justify-start gap-2 md:px-3.5">
            {samplePrompts.map((prompt) => (
            <Button
                key={`sample-prompt-${prompt}`}
                variant='secondary'
                onClick={() => setInput(prompt)}
                className='text-xs px-2 py-3 md:px-4 md:text-base bg-sky-600 hover:bg-sky-600 text-white hover:scale-[1.02] transition-transform duration-150'
            >
                {prompt}
            </Button>
            ))}
        </div>
    )
}