"use client";
import { useState, useEffect, useRef, useCallback } from "react";

import { ArrowUpDown, BriefcaseBusiness, MessageCirclePlus, NotebookPen, SearchCheck, UserRound } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import { getMoreConversationsAction } from "@/actions/crud/conversation";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type ChatState, useChatContext } from "@/context/ChatContext";

import ProfileDialog from "@/components/profile/profile-dialog";
import NotesDialog from "@/components/chat/notes-dialog";
import CheckupDialog from "@/components/chat/checkup-dialog";
import GetAdviceDialog from "@/components/chat/get-advice-dialog";
import PortfolioDialog from "@/components/portfolio/portfolio-dialog";
import DisclaimerDialog from "@/components/dialogs/disclaimer-dialog";
import ConversationSelector from "./conversation-selector";

const CONVERSATIONS_PER_PAGE = 16;

export default function AppSidebar() {
    const { state, dispatch } = useGlobalContext() as GlobalState;
    const { conversationId, onNewChat } = useChatContext() as ChatState;
    const [shouldFetchMore, setShouldFetchMore] = useState<boolean>((state?.conversations || []).length >= CONVERSATIONS_PER_PAGE);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (state?.id && state?.conversations && isAtBottom && shouldFetchMore) {
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
    }, [state?.id, state?.conversations, isAtBottom]);

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
        <Sidebar>
            <SidebarHeader className='px-3'>
                <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent className='px-3'>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <ProfileDialog>
                                    <Button
                                        variant='ghost'
                                        className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                    >
                                        <UserRound size={16} />
                                        Profile
                                    </Button>
                                </ProfileDialog>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <NotesDialog>
                                    <Button
                                        variant='ghost'
                                        className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                    >
                                        <NotebookPen size={16} />
                                        Notes ✨
                                    </Button>
                                </NotesDialog>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <PortfolioDialog>
                                    <Button
                                        variant='ghost'
                                        className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                    >
                                        <BriefcaseBusiness size={16} />
                                        Portfolio
                                    </Button>
                                </PortfolioDialog>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <Button
                                    variant='ghost'
                                    onClick={onNewChat}
                                    className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                >
                                    <MessageCirclePlus size={16} />
                                    New chat
                                </Button>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <CheckupDialog>
                                    <Button
                                        variant='ghost'
                                        className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                    >
                                        <SearchCheck size={16} />
                                        Portfolio review
                                    </Button>
                                </CheckupDialog>
                            </SidebarMenuItem>

                            <SidebarMenuItem>
                                <GetAdviceDialog>
                                    <Button
                                        variant='ghost'
                                        className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                    >
                                        <ArrowUpDown size={16} className='rotate-90' />
                                        Deposit/withdraw
                                    </Button>
                                </GetAdviceDialog>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <ScrollArea className='h-[calc(100%-20px)'>
                                <div className='flex flex-col gap-3'>
                                    {state?.conversations.map((conversation, index) => (
                                    <SidebarMenuItem key={`conversation-${conversation.id}-${index}`}>
                                        <ConversationSelector {...conversation} />
                                    </SidebarMenuItem>
                                    ))}

                                    <div className='w-full h-px' ref={bottomRef} />
                                </div>
                            </ScrollArea>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DisclaimerDialog>
                            <button className='w-full text-xs text-center underline mb-3'>
                                Disclaimer
                            </button>
                        </DisclaimerDialog>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}