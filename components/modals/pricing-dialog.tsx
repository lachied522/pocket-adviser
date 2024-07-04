"use client";
import { useState, useRef } from "react";

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
            <DialogContent className='max-w-2xl'>
                <DialogHeader>
                    <DialogTitle>
                        Pricing
                    </DialogTitle>
                </DialogHeader>
                <div className='grid grid-cols-2 gap-6 my-24'>
                    <div className='h-full flex flex-col justify-between gap-16 p-5 border border-slate-200 rounded-lg'>
                        <div className='flex flex-row items-end gap-2'>
                            <H1>Free</H1>
                            <H3 className='pb-1'>(default)</H3>
                        </div>

                        <div className='flex flex-col gap-6'>
                            <div className='flex flex-row items-center gap-2'>
                                <H1>US$0</H1>
                                <Text>per month</Text>
                            </div>

                            <Button disabled>
                                {!state || state.accountType === "FREE"? "Subscribed": "Subscribe"}
                            </Button>
                        </div>

                        <div className='h-[160px] flex flex-col items-center gap-2'>
                            <Text className='w-full text-start text-lg'>Includes:</Text>
                            <ol className='list-disc text-lg pl-3'>
                                <li>Up to 12 chat requests / day</li>
                                <li>Up to 3 portfolio reviews / day</li>
                            </ol>
                        </div>
                    </div>

                    <div className='h-full flex flex-col justify-between gap-16 p-5 border border-slate-200 rounded-lg'>
                        <H1>Paid</H1>

                        <div className='flex flex-col gap-6'>
                            <div className='flex flex-row items-center gap-2'>
                                <H1>US$10</H1>
                                <Text>per month</Text>
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

                        <div className='h-[160px] flex flex-col items-center gap-2'>
                            <Text className='w-full text-start text-lg'>Includes:</Text>
                            <ol className='list-disc text-lg pl-3'>
                                <li>Unlimited chat requests</li>
                                <li>Unlimited portfolio reviews</li>
                                <li>Many more features to come</li>
                            </ol>
                        </div>
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