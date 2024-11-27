"use client";
import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";


function extractConversationIdFromPathname(pathname: string) {
    const regex = /\/c\/([a-zA-Z0-9]+)/;
    const match = pathname.match(regex);
    return match ? match[1] : null;
}

export function useChatNavigation() {
    const router = useRouter();
    const pathname = usePathname();

    const onSubmit = useCallback(
        (query: string, options?: { toolName?: string, url?: string }) => {
            let url = '/';
            const conversationId = extractConversationIdFromPathname(pathname);
            url += conversationId? `c/${conversationId}`: '';
            url += `?query=${encodeURIComponent(query)}`;
            if (options) {
                if (options.toolName) url += `&toolName=${encodeURIComponent(options.toolName)}`;
            }
            if (conversationId) router.replace(url)
            else router.push(url);
        },
        [router, pathname]
    );

    const onNavigateConversation = useCallback(
        (conversationId?: string) => {
            // conversationId is undefined for new chat
            if (conversationId) router.replace(`/c/${conversationId}`)
            else router.replace('/');
        },
        [router]
    );

    return {
        onSubmit,
        onNavigateConversation,
    }
}