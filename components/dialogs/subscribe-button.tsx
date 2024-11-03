"use client";
import { useState } from "react";

import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";

import { createCheckoutSession } from "@/actions/billing/portals";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type UIState, useUIContext } from "@/context/UIContext";

export default function SubscribeButton() {
    const { state } = useGlobalContext() as GlobalState;
    const { openSignup } = useUIContext() as UIState;
    const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(false);

    const onSubscribe= async () => {
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

    return (
        <>
            {state? (
                <Button
                    onClick={onSubscribe}
                    disabled={isCheckoutLoading || state.accountType === "PAID"}
                >
                    {state.accountType === "PAID"? "Subscribed": "Subscribe"}
                    <ExternalLink size={16} className='ml-1' />
                </Button>
                ) : (
                <Button onClick={openSignup}>
                    Create an account
                </Button>
            )}
        </>
    )
}