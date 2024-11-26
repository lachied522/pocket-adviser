"use client";
import { useState } from "react";

import { ScrollText } from "lucide-react";

import { createBillingPortalSession } from "@/actions/billing/portals";

import { Button } from "@/components/ui/button";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

export default function BillingButton() {
    const { state } = useGlobalContext() as GlobalState;
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false);
    return (
        <Button
            aria-label='billing'
            variant='ghost'
            size='sm'
            onClick={async () => {
                if (isSessionLoading) return; // prevent multiple requests
                setIsSessionLoading(true);
    
                // create billing portal session and open in new tab
                const res = await createBillingPortalSession(state.id);
    
                if (!(res && res.url)) {
                    // TO DO
                    return;
                }
    
                window.open(res.url, '_blank');
                setIsSessionLoading(false);
            }}
            disabled={isSessionLoading}
            className='w-full h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
        >
            <ScrollText size={18} strokeWidth={2} />
            <span className='text-xs'>Manage plan</span>
        </Button>
    )
}