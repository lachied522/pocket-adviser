"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

import { createCheckoutSession } from "@/actions/billing/portals";

interface SubscribeButtonProps {
    userId?: string | null
}

export default function SubscribeButton({ userId }: SubscribeButtonProps) {
    const [isCheckoutLoading, setIsCheckoutLoading] = useState<boolean>(false);
    const router = useRouter();

    const onSubscribe = async () => {
        if (isCheckoutLoading) return; // prevent multiple requests
        setIsCheckoutLoading(true);

        if (!userId) {
            router.push('/signup');
            return;
        }

        // create billing portal session and open in new tab
        const res = await createCheckoutSession(userId);

        if (!(res && res.url)) {
            // TO DO
            return;
        }

        window.open(res.url, '_blank');
        setIsCheckoutLoading(false);
    }

    return (
        <Button
            onClick={onSubscribe}
            disabled={isCheckoutLoading}
        >
            Subscribe
        </Button>
    )
}