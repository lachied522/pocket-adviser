"use client";
import { useCallback, useState } from "react";
import { useChat } from 'ai/react';
import { generateId, type Message } from 'ai';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { ArrowBigUp, OctagonAlert, X } from "lucide-react";

import type { Profile } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { formSchema } from "@/app/(main)/profile/components/form-schema";
import { PlainTextMessage } from "@/components/ai/messages";

import { OnboardingStep, STEPS } from "./steps";

// use message data to keep track of step
type MessageData = {
    step: number
    isComplete?: boolean
}

interface OnboardingChatProps {
    initialValues?: Profile | null
}

export default function OnboardingChat({ initialValues }: OnboardingChatProps) {
    const [step, setStep] = useState<number>(0); // current step
    const { messages, input, isLoading, error, setInput, setMessages, append } = useChat({
        api: "/api/ai/onboarding",
        initialMessages: [
            { id: generateId(), role: "assistant", content: STEPS[0].content, data: { step: 0 } }
        ]
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dob: initialValues?.dob ?? new Date(),
            objective: initialValues?.objective ?? "RETIREMENT",
            employmentStatus: initialValues?.employmentStatus ?? "CASUAL",
            income: initialValues?.income ?? 0,
            percentIncomeInvested: initialValues?.percentIncomeInvested ?? 0.10,
            percentAssetsInvested: initialValues?.percentAssetsInvested ?? 0.10,
            experience: initialValues?.experience ?? 1,
            riskToleranceQ1: initialValues?.riskToleranceQ1 ?? 3,
            riskToleranceQ2: initialValues?.riskToleranceQ2 ?? 3,
            riskToleranceQ3: initialValues?.riskToleranceQ3 ?? 3,
            riskToleranceQ4: initialValues?.riskToleranceQ4 ?? 3,
            targetYield: initialValues?.targetYield ?? 0.01,
            international: initialValues?.international ?? 0.7,
            preferences: initialValues?.preferences ?? {},
            milestones: initialValues?.milestones ?? [],
        }
    });

    const handleUserMessage = useCallback(
        async (content: string) => {
            if (content.length < 1) return;
            append({ id: generateId(), role: "user", content });
            setInput('');
        },
        [append, setInput]
    );

    const onSubmit = useCallback(
        (values: z.infer<typeof formSchema>) => {
            console.log(values);
        },
        []
    );

    const completeStep = useCallback(
        (completedStep: number) => {
            if (completedStep < STEPS.length - 1) {
                setStep((curr) => curr + 1);
                setMessages(
                    (currMessages) => ([
                        ...currMessages.map(
                            (message) => (message.data as MessageData)?.step === completedStep?
                            { 
                                ...message,
                                data: { step: (message.data as MessageData).step, isComplete: true }
                            }:
                            message
                        ),
                        {
                            id: generateId(),
                            role: "assistant" as const,
                            content: STEPS[completedStep + 1].content,
                            data: { step: completedStep + 1 }
                        }
                    ])
                );
            }
        },
        [setStep, setMessages]
    );

    return (
        <div className='flex-1 flex flex-col overflow-hidden'>
            <div className='flex-1 flex overflow-y-auto scroll-smooth'>
                <div className='max-w-7xl flex mx-auto'>
                    <FormProvider {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='flex flex-col justify-start gap-12'
                        >
                            {messages.map((message: Message) => (
                            <div
                                key={message.id}
                                className={cn(
                                    'w-full flex flex-col items-start gap-2',
                                    message.role === "user" && 'items-end'
                                )}
                            >
                                {message.data ? (
                                <OnboardingStep
                                    {...(message.data as MessageData)}
                                    onNextStep={() => completeStep(step)}
                                />
                                ) : (
                                <>
                                    <div className='text-sm font-medium text-zinc-400'>
                                        {message.role === "assistant"? "Pocket Adviser": "Me"}
                                    </div>
                                    <PlainTextMessage
                                        content={message.content}
                                    />
                                </>
                                )}
                            </div>
                            ))}

                            {error && (
                            <div className='flex items-center justify-center gap-2 p-6'>
                                <OctagonAlert size={16} color="rgb(220 38 38)" />
                                <p className='text-sm'>Something went wrong. Please try again later.</p>
                            </div>
                            )}
                        </form>
                    </FormProvider>
                </div>
            </div>

            <div className='w-full max-w-7xl flex flex-col justify-center gap-3 px-2 pb-3 md:pb-6 mx-auto'>
                <span className='text-xs text-center'>Please double-check important information and contact a financial adviser if you require advice.</span>

                <div className='w-full flex flex-row gap-1'>
                    <div className="h-12 flex-1 flex flex-row border border-zinc-100 rounded-l-md overflow-hidden">
                        <Input
                            value={input}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter' && !isLoading) {
                                    handleUserMessage(input);
                                }
                            }}
                            placeholder='Ask me something!'
                            className='h-full w-full text-sm font-medium bg-zinc-100 border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                        />
                    </div>

                    <Button
                        onClick={() => {
                            handleUserMessage(input);
                        }}
                        disabled={isLoading || step === 0}
                        className="h-12 aspect-square p-0"
                    >
                        <ArrowBigUp size={24} strokeWidth={2} color="white"/>
                    </Button>
                </div>
            </div>
        </div>
    )
}