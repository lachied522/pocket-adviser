"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

import { getMoreConversationsAction } from "@/actions/crud/conversation";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import ConversationSelector from "./conversation-selector";

const CONVERSATIONS_PER_PAGE = 25;

export default function Conversations() {
    const { state, dispatch } = useGlobalContext() as GlobalState;
    const [shouldFetchMore, setShouldFetchMore] = useState<boolean>((state.conversations).length >= CONVERSATIONS_PER_PAGE);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
    const pathname = usePathname();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (state.conversations && isAtBottom && shouldFetchMore) {
            fetchConversations(state.id, Math.floor(state.conversations.length / CONVERSATIONS_PER_PAGE));
        }

        async function fetchConversations(userId: string, nextPage: number) {
            const _conversations = await getMoreConversationsAction(userId, nextPage, CONVERSATIONS_PER_PAGE);
            for (const _conversation of _conversations) {
                dispatch({
                    type: 'INSERT_CONVERSATION_END',
                    payload: _conversation,
                });
            }
            setShouldFetchMore(_conversations.length >= CONVERSATIONS_PER_PAGE);
        }
    }, [state.id, state.conversations, isAtBottom, shouldFetchMore, dispatch, setShouldFetchMore]);

    useEffect(() => {
        // trigger fetch for when bottomRef is in view
        let observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    setIsAtBottom(entry.isIntersecting);
                })
            },
            {
                rootMargin: '0px 0px -100px 0px'
            }
        );

        if (bottomRef.current) {
            observer.observe(bottomRef.current);
        }

        return () => {
            observer.disconnect();
        }
    }, []);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Conversations</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu className='flex flex-col gap-3'>
                    {state.conversations.length > 1 ? (
                    <>
                        {state.conversations
                        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                        .map((conversation, index) => (
                        <SidebarMenuItem key={`conversation-${conversation.id}-${index}`}>
                            <ConversationSelector isActive={pathname.includes(conversation.id)} {...conversation} />
                        </SidebarMenuItem>
                        ))}

                        <div className='w-full h-px' ref={bottomRef} />
                    </>
                    ) : (
                    <SidebarMenuItem className='text-center p-2'>
                        <span className='text-xs'>Nothing here yet</span>
                    </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}