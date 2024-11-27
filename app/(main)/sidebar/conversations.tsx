"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import { getMoreConversationsAction } from "@/actions/crud/conversation";

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import ConversationSelector from "./conversation-selector";

const CONVERSATIONS_PER_PAGE = 20;

export default function Conversations() {
    const { state, dispatch } = useGlobalContext() as GlobalState;
    const [shouldFetchMore, setShouldFetchMore] = useState<boolean>(state.conversations.length <= CONVERSATIONS_PER_PAGE);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
    const pathname = usePathname();
    const scrollAreaRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (state.conversations && isAtBottom && shouldFetchMore) {
            fetchConversations();
        }

        async function fetchConversations() {
            const _conversations = await getMoreConversationsAction(
                state.id,
                Math.floor(state.conversations.length / CONVERSATIONS_PER_PAGE),
                CONVERSATIONS_PER_PAGE
            );

            setShouldFetchMore(_conversations.length >= CONVERSATIONS_PER_PAGE);

            for (const _conversation of _conversations) {
                dispatch({
                    type: 'INSERT_CONVERSATION',
                    payload: _conversation,
                });
            }
        }
    }, [state.id, state.conversations, isAtBottom, shouldFetchMore, dispatch, setShouldFetchMore]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const handleScroll = (event: Event) => {
                const target = event.target as HTMLDivElement;
                const offset = 50;
                setIsAtBottom(target.scrollTop + target.clientHeight >= target.scrollHeight - offset);
            }
            
            scrollAreaRef.current.addEventListener('scroll', handleScroll);

            return () => {
                scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
            }
        }
    }, []);

    return (
        <SidebarGroup className='overflow-hidden'>
            <SidebarGroupLabel>Conversations</SidebarGroupLabel>
            <SidebarGroupContent className='flex overflow-hidden'>
                <SidebarMenu ref={scrollAreaRef} className='overflow-y-auto'>
                    {state.conversations.length > 1 ? (
                    <>
                        {state.conversations
                        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
                        .map((conversation, index) => (
                        <SidebarMenuItem key={`conversation-${conversation.id}-${index}`}>
                            <ConversationSelector isActive={pathname.includes(conversation.id)} {...conversation} />
                        </SidebarMenuItem>
                        ))}
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