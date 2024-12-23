"use client";
import { useCallback, useState } from "react";
import { useChat } from 'ai/react';
import { generateId, type Message } from 'ai';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";

import { ArrowBigUp, ExternalLink, Home, OctagonAlert, RefreshCcw } from "lucide-react";

import { updateProfileAction } from "@/actions/crud/profile";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { formSchema, defaultValues } from "@/components/profile/form-schema";
import { PlainTextMessage } from "@/components/ai/messages";

import { OnboardingStep, STEPS } from "./steps";
import ProgressBar from "./progress-bar";
import Link from "next/link";

// use message data to keep track of step
type MessageData = {
    step: number
    isComplete?: boolean
}

interface OnboardingChatProps {
    userId: string
    isNewUser?: boolean
}

export default function ProfileChat({
    userId,
    isNewUser
}: OnboardingChatProps) {
    const [currentStep, setCurrentStep] = useState<number>(0); // current step
    const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false);
    const [isComplete, setIsComplete] = useState<boolean>(false);
    const { messages, input, isLoading, error, setInput, setMessages, append } = useChat({
        api: "/api/ai/onboarding",
        initialMessages: [
            { id: generateId(), role: "assistant", content: STEPS[0].content, data: { step: 0 } }
        ],
        body: {
            userId,
        }
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
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
        async (values: z.infer<typeof formSchema>) => {
            setIsSubmitLoading(true);

            try {
                await updateProfileAction(
                    userId,
                    values
                );

                setIsComplete(true);
            } catch (e) {
                console.error(e);
            }

            setIsSubmitLoading(false);
        },
        [userId, setIsComplete]
    );

    const onReset = useCallback(
        () => {
            form.reset();
            setCurrentStep(0);
            setIsComplete(false);
            setMessages([
                { id: generateId(), role: "assistant", content: STEPS[0].content, data: { step: 0 } }
            ]);
        },
        [form, setCurrentStep, setIsComplete, setMessages]
    )

    const completeStep = useCallback(
        (completedStep: number) => {
            if (completedStep < STEPS.length - 1) {
                setCurrentStep((curr) => curr + 1);
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
        [setCurrentStep, setMessages]
    );

    return (
        <>
            <div className='flex flex-row items-center justify-between gap-6 p-6'>
                <div className='shrink-0'>
                    <h1 className='font-medium'>My Profile</h1>
                </div>

                <ProgressBar currentStep={currentStep} />

                <Button
                    type='button'
                    variant='secondary'
                    size='sm'
                    onClick={onReset}
                >
                    Restart
                </Button>
            </div>

            <div className='flex-1 flex flex-col overflow-hidden'>
                <div className='flex-1 flex overflow-y-auto scroll-smooth'>
                    <div className='w-full max-w-6xl flex mx-auto'>
                        <FormProvider {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className='flex-1 flex flex-col justify-start gap-12 px-3 sm:px-6'
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
                                        step={(message.data as MessageData).step}
                                        disabled={isComplete || isLoading || isSubmitLoading || (message.data as MessageData).isComplete}
                                        onNextStep={() => completeStep((message.data as MessageData).step)}
                                        handleUserMessage={handleUserMessage}
                                    />
                                    ) : (
                                    <>
                                        <div className='text-sm font-medium text-zinc-400'>
                                            {message.role === "assistant"? "Pocket Adviser": "Me"}
                                        </div>
                                        <PlainTextMessage
                                            role={message.role as "user"|"assistant"}
                                            content={message.content}
                                        />
                                    </>
                                    )}
                                </div>
                                ))}

                                {isComplete && (
                                <div className='w-full flex flex-col items-start gap-2'>
                                    <div className='text-sm font-medium text-zinc-400'>
                                        Pocket Adviser
                                    </div>

                                    <PlainTextMessage
                                        content={STEPS[STEPS.length - 1].content}
                                    />

                                    <div className='w-full flex flex-row items-center justify-center gap-3 p-6'>
                                        <Button
                                            type='button'
                                            variant='secondary'
                                            onClick={onReset}
                                            className='flex flex-row gap-2 justify-start'
                                        >
                                            <RefreshCcw size={16} />
                                            Start Again
                                        </Button>

                                        <Link href={isNewUser? '/onboarding/portfolio': '/'}>
                                            {isNewUser? (
                                            <Button className='flex flex-row gap-2 justify-start'>
                                                Next
                                                <ExternalLink size={16} />
                                            </Button>
                                            ): (
                                            <Button className='flex flex-row gap-2 justify-start'>
                                                <Home size={16} />
                                                Dashboard
                                            </Button>
                                            )}
                                        </Link>
                                    </div>
                                </div>
                                )}

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

                <div className='w-full max-w-6xl flex flex-col justify-center gap-3 px-2 py-3 mx-auto'>
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
                                disabled={isComplete || currentStep === 0}
                                placeholder='Ask me something!'
                                className='h-full w-full text-sm font-medium bg-zinc-100 border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                            />
                        </div>

                        <Button
                            onClick={() => {
                                handleUserMessage(input);
                            }}
                            disabled={isComplete || isLoading || isSubmitLoading || currentStep === 0}
                            className="h-12 aspect-square p-0"
                        >
                            <ArrowBigUp size={24} strokeWidth={2} color="white"/>
                        </Button>
                    </div>
                </div>
            </div>
        </>

    )
}