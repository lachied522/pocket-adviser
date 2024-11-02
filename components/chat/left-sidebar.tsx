"use client";

import { ArrowUpDown, MessageCirclePlus, SearchCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";
import { type ChatState, useChatContext } from "@/context/ChatContext";

import ProfileDialog from "../profile/profile-dialog";
import GetAdviceDialog from "./get-advice-dialog";
import CheckupDialog from "./checkup-dialog";
import ConversationSelector from "./conversation-selector";

export default function LeftSidebar() {
    const { state } = useGlobalContext() as GlobalState;
    const { conversationId, onNewChat } = useChatContext() as ChatState;

    return (
        <div className='xl:w-[200px] grid grid-cols-1 auto-rows-min gap-2 xl:gap-6'>
            <div className='flex flex-wrap items-center'>
                <ProfileDialog>
                    <Button
                        variant='ghost'
                        className='xl:w-[180px] flex flex-row justify-start gap-2 font-medium py-3 border border-neutral-600'
                    >
                        <UserRound size={16} />
                        My profile
                    </Button>
                </ProfileDialog>
            </div>

            <Separator className='xl:w-[180px] my-2 xl:my-auto' />
            
            <ScrollArea className=''>
                <div className='flex flex-row xl:flex-col items-center xl:items-start gap-3.5'>
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

            <Separator className='xl:w-[180px] my-2 xl:my-auto' />

            <ScrollArea className='xl:h-[360px]'>
                <div className='flex flex-row xl:flex-col items-center xl:items-start gap-3.5 pb-2 xl:pb-0'>
                    {state?.conversations.map((conversation) => (
                    <ConversationSelector
                        key={`conversation-${conversation.id}`}
                        {...conversation}
                    />
                    ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}