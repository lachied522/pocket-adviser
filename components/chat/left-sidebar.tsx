"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowUpDown, History, MessageCirclePlus, NotebookPen, PencilRuler, SearchCheck, UserRound } from "lucide-react";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { getMoreConversationsAction } from "@/actions/crud/conversation";

import { useMediaQuery } from "@/hooks/useMediaQuery";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type ChatState, useChatContext } from "@/context/ChatContext";

import ProfileDialog from "../profile/profile-dialog";
import NotesDialog from "./notes-dialog";
import GetAdviceDialog from "./get-advice-dialog";
import CheckupDialog from "./checkup-dialog";
import ConversationSelector from "./conversation-selector";

const CONVERSATIONS_PER_PAGE = 10;

// TO DO: handle pagination on mobile

export default function LeftSidebar() {
    const { state, dispatch } = useGlobalContext() as GlobalState;
    const { conversationId, onNewChat } = useChatContext() as ChatState;
    const [shouldFetchMore, setShouldFetchMore] = useState<boolean>((state?.conversations || []).length >= CONVERSATIONS_PER_PAGE);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const isMobile = useMediaQuery(1280);

    const fetchConversations = useCallback(
        async (nextPage: number) => {
            if (state?.id && shouldFetchMore) {
                const _conversations = await getMoreConversationsAction(state.id, nextPage, CONVERSATIONS_PER_PAGE);
                for (const _conversation of _conversations) {
                    dispatch({
                        type: 'INSERT_CONVERSATION_END',
                        payload: _conversation,
                    });
                }
                setShouldFetchMore(_conversations.length >= CONVERSATIONS_PER_PAGE);
            }
        },
        [state?.id, shouldFetchMore, setShouldFetchMore, dispatch]
    );

    useEffect(() => {
        if (state?.conversations && isAtBottom) {
            fetchConversations(Math.floor(state.conversations.length / CONVERSATIONS_PER_PAGE));
        }
    }, [state?.conversations, isAtBottom]);

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
        <div className='xl:w-[200px] flex flex-wrap xl:flex-col justify-between xl:justify-normal gap-3'>
            <div className='flex flex-row xl:flex-col justify-between xl:justify-normal gap-3'>
                <ProfileDialog>
                    <Button
                        variant='ghost'
                        className='w-auto xl:w-[180px] flex flex-row justify-start gap-2 font-medium py-3 border border-neutral-600'
                    >
                        <UserRound size={16} />
                        Profile
                    </Button>
                </ProfileDialog>

                <NotesDialog>
                    <Button
                        variant='ghost'
                        className='w-auto xl:w-[180px] flex flex-row justify-start gap-2 font-medium py-3 border border-neutral-600'
                    >
                        <NotebookPen size={16} />
                        Notes ✨
                    </Button>
                </NotesDialog>
            </div>

            {isMobile? (
            <div className='flex flex-row items-center justify-end gap-3'>
                <Button
                    variant='secondary'
                    onClick={() => {
                        if (conversationId) onNewChat();
                    }}
                    className='w-auto flex flex-row justify-start gap-2 font-medium py-3'
                >
                    <MessageCirclePlus size={16} />
                    <span className='hidden sm:block'>New chat</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant='secondary'
                            className='w-auto flex flex-row justify-start gap-2 font-medium py-3'
                        >
                            <PencilRuler size={16} />
                            <span className='hidden sm:block'>Quick Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className='w-auto flex flex-col items-center gap-3.5 p-2'>
                        <DropdownMenuItem asChild>
                            <CheckupDialog>
                                <Button
                                    variant='ghost'
                                    className='w-[180px] flex flex-row justify-start gap-2 font-medium py-3'
                                >
                                    <SearchCheck size={16} />
                                    Portfolio review
                                </Button>
                            </CheckupDialog>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild>
                            <GetAdviceDialog>
                                <Button
                                    variant='ghost'
                                    className='w-[180px] flex flex-row justify-start gap-2 font-medium py-3'
                                >
                                    <ArrowUpDown size={16} className='rotate-90' />
                                    Deposit/withdraw
                                </Button>
                            </GetAdviceDialog>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant='secondary'
                            className='w-auto flex flex-row justify-start gap-2 font-medium py-3'
                        >
                            <History size={16} />
                            <span className='hidden sm:block'>History</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        collisionPadding={{ right: 20 }}
                        className='w-auto p-2'
                    >
                        <ScrollArea className='h-[440px]'>
                            <div className='flex flex-col items-center gap-2 relative'>
                                {state?.conversations.map((conversation, index) => (
                                <DropdownMenuItem key={`conversation-${conversation.id}-${index}`}  asChild>
                                    <ConversationSelector {...conversation} />
                                </DropdownMenuItem>
                                ))}

                                {!state || state.conversations.length < 1 && (
                                <DropdownMenuItem>No conversations</DropdownMenuItem>
                                )}
                            </div>
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            ) : (
            <div className='hidden sm:flex flex-row xl:flex-col gap-3'>
                <Separator className='hidden xl:block xl:w-[180px] my-2 xl:my-auto' />
            
                <ScrollArea className=''>
                    <div className='flex flex-row xl:flex-col items-center xl:items-start gap-3.5'>
                        <CheckupDialog>
                            <Button
                                variant='ghost'
                                className='xl:w-[180px] flex flex-row justify-start gap-2 font-medium py-3 border border-neutral-600'
                            >
                                <SearchCheck size={16} />
                                Portfolio review
                            </Button>
                        </CheckupDialog>

                        <GetAdviceDialog>
                            <Button
                                variant='ghost'
                                className='xl:w-[180px] flex flex-row justify-start gap-2 font-medium py-3 border border-neutral-600'
                            >
                                <ArrowUpDown size={16} className='rotate-90' />
                                Deposit/withdraw
                            </Button>
                        </GetAdviceDialog>
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <Separator className='hidden xl:block xl:w-[180px] my-2 xl:my-auto' />

                <Button
                    variant='ghost'
                    onClick={() => {
                        if (conversationId) onNewChat();
                    }}
                    className='xl:w-[180px] flex flex-row justify-start gap-2 font-medium py-3 border border-neutral-600'
                >
                    <MessageCirclePlus size={16} />
                    New chat
                </Button>

                <ScrollArea className='xl:h-[440px]'>
                    <div className='flex flex-row xl:flex-col items-center xl:items-start gap-3.5 pb-2 xl:pb-0'>
                        {state?.conversations.map((conversation, index) => (
                        <ConversationSelector
                            key={`conversation-${conversation.id}-${index}`}
                            {...conversation}
                        />
                        ))}

                        <div className='w-full h-px' ref={bottomRef} />
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
            )}            
        </div>
    )
}