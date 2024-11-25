"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

export function useAskAI() {
    const router = useRouter();

    const onSubmit = useCallback(
        (query: string) => {
            router.push(`/?query=${encodeURIComponent(query)}`);
        },
        [router]
    );

    return {
        onSubmit,
    }
}