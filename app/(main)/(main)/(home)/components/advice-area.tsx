"use client";
import { useChatNavigation } from "@/hooks/useChatNavigation";

import { Button } from "@/components/ui/button";

import AdviceTabs from "@/components/advice/advice-tabs";

import type { Advice } from "@prisma/client";

interface TransactionsProps {
    advice?: Advice
}

export default function AdviceArea({
    advice
}: TransactionsProps) {
    const { onSubmit } = useChatNavigation();

    return (
        <div className='flex flex-col gap-3'>
            <p>Suggestions for you</p>
            {(advice && advice.transactions.length > 0) ? (
            <div className='flex flex-col items-start gap-3'>
                <AdviceTabs advice={advice} />

                <div className='w-full flex flex-row items-center justify-end'>
                    <Button
                        size='dynamic'
                        onClick={() => {
                            onSubmit(
                                "Tell me more about why I should consider the above transactions",
                                { adviceId: String(advice.id) }
                            )
                        }}
                    >
                        Find out more
                    </Button>
                </div>
            </div>
            ) : (
            <div className='flex items-center justify-center p-12'>
                <span className='text-sm'>Nothing here yet.</span>
            </div>
            )}
        </div>
    )
}