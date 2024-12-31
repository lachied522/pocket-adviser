"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import AdviceTabs from "@/components/advice/advice-tabs";

import type { Advice } from "@prisma/client";

interface TransactionsProps {
    advice?: Advice
}

export default function AdviceArea({
    advice
}: TransactionsProps) {
    return (
        <div className='flex flex-col gap-3'>
            <p>Suggestions for you</p>
            {(advice && advice.transactions.length > 0) ? (
            <div className='flex flex-col items-start gap-3'>
                <AdviceTabs advice={advice} />

                <div className='w-full flex flex-row items-center justify-end'>
                    <Link href={`/?adviceId=${advice.id}&query=${encodeURIComponent("Tell me more about why I should consider the above transactions")}`}>
                        <Button size='dynamic'>
                            Find out more
                        </Button>
                    </Link>
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