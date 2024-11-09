"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";

import { createBillingPortalSession } from "@/actions/billing/portals";

interface BillingButtonProps {
    userId?: string | null
}

export default function BillingButton({ userId }: BillingButtonProps) {
    const [isSessionLoading, setIsSessionLoading] = useState<boolean>(false);
    const router = useRouter();

    const onClick = async () => {
        if (isSessionLoading) return; // prevent multiple requests
        setIsSessionLoading(true);

        if (!userId) {
            router.push('/signup');
            return;
        }

        // create billing portal session and open in new tab
        const res = await createBillingPortalSession(userId);

        if (!(res && res.url)) {
            // TO DO
            return;
        }

        window.open(res.url, '_blank');
        setIsSessionLoading(false);
    }

    return (
        <Button
            aria-label='billing'
            variant='ghost'
            size='sm'
            onClick={onClick}
            className='h-[42px] grid grid-cols-[20px_1fr] justify-items-start font-medium gap-2 px-2'
        >
            <ScrollText size={18} strokeWidth={2} />
            <span className='text-xs'>Billing</span>
        </Button>
    )
}