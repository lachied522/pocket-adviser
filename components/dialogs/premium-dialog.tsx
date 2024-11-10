"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, ScrollText } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { H1, H3 } from "@/components/ui/typography";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

import { createCheckoutSession, createBillingPortalSession } from "@/actions/billing/portals";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

interface SubscribeButtonProps {
    userId?: string | null,
    accountType?: "FREE"|"PAID"|"ADMIN"
}

function SubscribeButton({ userId, accountType = "FREE" }: SubscribeButtonProps) {
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false);
    const router = useRouter();

    const onClick = async () => {
        if (isSessionLoading) return; // prevent multiple requests
        setIsSessionLoading(true);

        if (!userId) {
            router.push('/signup');
            return;
        }

        if (accountType !== "PAID") {
            const res = await createCheckoutSession(userId);

            if (!(res && res.url)) {
                // TO DO
                return;
            }

            window.open(res.url, '_blank');
        } else {
            // create billing portal session and open in new tab
            const res = await createBillingPortalSession(userId);

            if (!(res && res.url)) {
                // TO DO
                return;
            }

            window.open(res.url, '_blank');
        }


        setIsSessionLoading(false);
    }

    return (
        <>
            {userId && accountType === "PAID"? (
            <Button
                size='lg'
                disabled
            >
                Your current plan
            </Button>
            ) : (
            <Button
                aria-label='subscribe'
                size='lg'
                onClick={onClick}
                disabled={isSessionLoading}
            >
                Subscribe
            </Button> 
            )}
        </>
    )
}

interface PremiumDialogProps {
    children: React.ReactNode
}

export default function PremiumDialog({ children }: PremiumDialogProps) {
    const { state } = useGlobalContext() as GlobalState;

    return (
        <Dialog>
            <DialogTrigger className='p-0' asChild>
                { children }
            </DialogTrigger>
            <DialogContent className='h-screen w-full max-w-[100vw] border-none shadow-none rounded-none overflow-auto'>
                <div className='flex flex-col items-center gap-3 m-auto'>
                    <H1>Upgrade your plan</H1>
                    <div className='h-fit flex flex-col sm:flex-row items-stretch justify-center gap-3 my-12'>
                        <div className='flex-1 max-w-sm flex flex-col gap-6 p-3 sm:p-5 bg-white border-2 border-zinc-100 rounded-lg'>
                            <H1>Free</H1>
                            <p>Default plan</p>
                            <div className=''>
                                <div>Price <span className='text-sm'>(USD)</span></div>
                                <div className='inline-flex items-end'>
                                    <H1>$0</H1>
                                    <span className='text-lg text-slate-600 ml-1 mb-0.5'>/month</span>
                                </div>
                            </div>
                            <Button
                                disabled
                                className='w-full'
                            >
                                Create free account
                            </Button>
                            <div>
                                <div className='mb-3'>Includes:</div>
                                <div className='grid grid-cols-[24px_1fr] gap-x-2'>
                                    <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                    <div><b>Up to 12</b> chat requests / day</div>
                                    <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                    <div><b>1 free</b> advice request / day</div>
                                </div>
                            </div>
                        </div>

                        <div className='flex-1 max-w-sm flex flex-col gap-6 p-3 sm:p-5 bg-zinc-50 border-2 border-zinc-600 rounded-lg'>
                            <H1>Premium</H1>
                            <p>Unrestricted and enhanced access</p>
                            <div className=''>
                                <div>Price <span className='text-sm'>(USD)</span></div>
                                <div className='inline-flex items-end'>
                                    <H1>$10</H1>
                                    <span className='text-lg text-slate-600 ml-1 mb-0.5'>/month</span>
                                </div>
                            </div>
                            <SubscribeButton
                                userId={state?.id}
                                accountType={state?.accountType}
                            />
                            <div>
                                <div className='mb-3'>Includes:</div>
                                <div className='grid grid-cols-[24px_1fr] gap-x-2'>
                                    <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                    <div><b>Unlimited</b> chat requests</div>
                                    <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                    <div><b>Unlimited</b> advice requests</div>
                                    <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                    <div>More personalised conversations with Notes 📝</div>
                                    <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                    <div>Daily/weekly market updates straight to your inbox (see below)</div>
                                </div>
                            </div>
                        </div>
                    </div>
 
                    <div className='w-full flex flex-row justify-end'>
                        <button
                            onClick={async () => {
                                if (!state) return;
                                const res = await createBillingPortalSession(state.id);

                                if (!(res && res.url)) {
                                    // TO DO
                                    return;
                                }

                                window.open(res.url, '_blank');
                            }}
                            className='flex flex-row items-center text-xs underline gap-1'
                        >
                            Manage my subscription
                            <ExternalLink size={12} />
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}