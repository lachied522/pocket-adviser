"use client";
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
                        className='h-[42px] xl:w-[180px] flex font-medium justify-start py-3 border border-slate-100'
                    >
                        <span className='text-lg mr-1 lg:mr-2'>✏️</span>
                        Edit profile
                    </Button>
                </ProfileDialog>
            </div>

            <Separator className='xl:w-[180px]' />
            
            <div className='flex flex-wrap lg:flex-row xl:flex-col items-center xl:items-start gap-3.5'>
                <Button
                    variant='ghost'
                    onClick={onReset}
                    className='h-[42px] xl:w-[180px] flex font-medium justify-start py-3 border border-slate-100'
                >
                    <span className='text-lg mr-1 lg:mr-2'>🌱</span>
                    New chat
                </Button>

                <CheckupDialog>
                    <Button
                        variant='ghost'
                        className='h-[42px] xl:w-[180px] flex font-medium justify-start py-3 border border-slate-100'
                    >
                        <span className='text-lg mr-1 lg:mr-2'>📝</span>
                        Portfolio review
                    </Button>
                </CheckupDialog>

                <GetAdviceDialog>
                    <Button
                        variant='ghost'
                        className='h-[42px] xl:w-[180px] flex font-medium justify-start py-3 border border-slate-100'
                    >
                        <span className='text-lg mr-1 lg:mr-2'>📈</span>
                        Deposit/withdraw
                    </Button>
                </GetAdviceDialog>
            </div>
        </div>
    )
}