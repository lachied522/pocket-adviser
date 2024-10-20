"use client";

import { ArrowUpDown, MessageCirclePlus, SearchCheck, UserRoundCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { type ChatState, useChatContext } from "@/context/ChatContext";

import ProfileDialog from "../profile/profile-dialog";
import GetAdviceDialog from "./get-advice-dialog";
import CheckupDialog from "./checkup-dialog";

export default function LeftSidebar() {
    const { onReset } = useChatContext() as ChatState;

    return (
        <div className='grid grid-cols-1 auto-rows-min gap-2 xl:gap-6'>
            <div className='flex flex-wrap items-center'>
                <ProfileDialog>
                    <Button
                        variant='ghost'
                        className='xl:w-[180px] flex flex-row justify-start gap-2 font-medium py-3 border border-neutral-600'
                    >
                        <UserRoundCog size={16} />
                        Edit profile
                    </Button>
                </ProfileDialog>
            </div>

            <Separator className='xl:w-[180px]' />
            
            <div className='flex flex-wrap lg:flex-row xl:flex-col items-center xl:items-start gap-3.5'>
                <Button
                    variant='ghost'
                    onClick={onReset}
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
        </div>
    )
}