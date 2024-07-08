"use client";
import { useState, useRef } from "react";

import { CircleCheck } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { H1, H3, Text } from "@/components/ui/typography";
import { cn } from "@/components/utils";

import { createCheckoutSession } from "@/actions/billing/portals";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type UIState, useUIContext } from "@/context/UIContext";

interface PricingDialogProps {
    children: React.ReactNode
}

export default function PricingDialog({ children }: PricingDialogProps) {
    const { state } = useGlobalContext() as GlobalState;
    const { openSignup } = useUIContext() as UIState;
    const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(false);
    const closeRef = useRef<HTMLButtonElement>(null);

    const onSubscribeButtonClick = async () => {
        if (isCheckoutLoading) return; // prevent multiple requests
        setIsCheckoutLoading(true);

        // create billing portal session and open in new tab
        const res = await createCheckoutSession(state!);

        if (!(res && res.url)) {
            // TO DO
            return;
        }

        window.open(res.url, '_blank');
        setIsCheckoutLoading(false);
    }

    const onCreateAccountButtonClick = async () => {
        if (closeRef.current) closeRef.current.click();
        openSignup();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-w-xl'>
                <DialogHeader>
                    <DialogTitle>
                        Pricing
                    </DialogTitle>
                </DialogHeader>
                <div className='grid grid-cols-2 gap-6 my-3'>
                    <div className='col-span-2'>
                        <span>Pricing in <b>USD</b></span>
                    </div>

                    <div className={cn(
                        'flex flex-col justify-between gap-10 p-5 border border-slate-200 rounded-lg relative hover:scale-[1.01]',
                        !state || state.accountType === "FREE" && 'bg-sky-50 border-2 border-sky-600'
                    )}>
                        {!state || state.accountType === "FREE" && (
                        <div className='absolute top-0 right-0 p-3'>
                            <CircleCheck size={24} strokeWidth={2} color='rgb(2 132 199)' />
                        </div>
                        )}
                        <div className='flex flex-row items-end gap-2'>
                            <H1>Free</H1>
                            <H3 className='pb-1'>(default)</H3>
                        </div>

                        <div className='flex flex-col gap-6'>
                            <div className='inline-flex items-end'>
                                <H1>$0</H1>
                                <Text className='text-slate-600 ml-1 mb-1'>/month</Text>
                            </div>

                            <Button disabled>
                                {!state || state.accountType === "FREE"? "Subscribed": "Subscribe"}
                            </Button>
                        </div>
                    </div>

                    <div
                        className={cn(
                            'flex flex-col justify-between gap-10 p-5 border border-slate-200 rounded-lg relative hover:scale-[1.01]',
                            state && state.accountType !== "FREE" && 'bg-sky-50 border-2 border-sky-600'
                        )}
                    >
                        {state && state.accountType !== "FREE" && (
                        <div className='absolute top-0 right-0 p-3'>
                            <CircleCheck size={24} strokeWidth={2} color='rgb(2 132 199)' />
                        </div>
                        )}
                        <H1>Paid</H1>

                        <div className='flex flex-col gap-6'>
                            <div className='inline-flex items-end'>
                                <H1>$10</H1>
                                <Text className='text-slate-600 ml-1 mb-1'>/month</Text>
                            </div>

                           {state? (
                            <Button
                                onClick={onSubscribeButtonClick}
                                disabled={isCheckoutLoading || state.accountType === "PAID"}
                            >
                                {state.accountType === "PAID"? "Subscribed": "Subscribe"}
                            </Button>
                            ) : (
                            <Button onClick={onCreateAccountButtonClick}>
                                Create an account
                            </Button>
                            )}
                        </div>
                    </div>

                    <div className='h-[160px] flex flex-col items-center gap-3.5'>
                        <Text className='w-full text-start text-lg'>Includes:</Text>
                        <ol className='list-disc pl-3'>
                            <li>Up to 12 chat requests / day</li>
                            <li>Up to 3 portfolio reviews / day</li>
                        </ol>
                    </div>

                    <div className='h-[160px] flex flex-col items-center gap-3.5'>
                        <Text className='w-full text-start text-lg'>Includes:</Text>
                        <ol className='list-disc pl-3'>
                            <li><b>Unlimited</b> chat requests</li>
                            <li><b>Unlimited</b> portfolio reviews</li>
                            <li><b>New!</b> Personalised newsletter straight to your inbox</li>
                        </ol>
                    </div>
                </div>

                <DialogClose asChild>
                    <Button
                        ref={closeRef}
                        className='hidden'
                    />
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}