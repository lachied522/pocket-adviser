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
            <p>Daily suggestions</p>
            {(advice && advice.transactions.length > 0) ? (
            <div className='flex flex-col items-start gap-3'>
                <AdviceTabs advice={advice} />

                <div className='w-full flex flex-row items-center justify-end'>
                    <Link href={`/?adviceId=${advice.id}&query=${encodeURIComponent("Tell me more about why I should consider the above transactions")}`}>
                        <Button>
                            Find out more
                        </Button>
                    </Link>
                </div>
            </div>
            ) : (
            <div className='flex items-center justify-center'>
                <span>Nothing here yet.</span>
            </div>
            )}
        </div>
    )
}