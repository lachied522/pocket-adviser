"use client";
import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

type SubmitOptions = {
    adviceId?: string
    toolName?: string
}

export function extractConversationIdFromPathname(pathname: string) {
    const regex = /chat\/c\/([a-zA-Z0-9]+)/;
    const match = pathname.match(regex);
    return match ? match[1] : null;
}

export function useChatNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const onSubmit = useCallback(
        (query: string, options?: SubmitOptions) => {
            const conversationId = extractConversationIdFromPathname(pathname);
            let url = conversationId? `/chat/c/${conversationId}`: '/chat';

            url += `/?${new URLSearchParams({ query, ...options }).toString()}`;

            if (conversationId) router.replace(url)
            else router.push(url);
        },
        [router, pathname]
    );

    const onNavigateConversation = useCallback(
        (conversationId?: string) => {
            // conversationId is undefined for new chat
            if (conversationId) {
                router.push(`/chat/c/${conversationId}`);
            } else {
                router.push("/chat");
            }
        },
        [router]
    );

    return {
        onSubmit,
        onNavigateConversation,
    }
}