"use client";
import { Button } from "@/components/ui/button";

import { type ChatState, useChatContext } from "@/context/ChatContext";

import GetAdviceDialog from "./get-advice-dialog";
import CheckupDialog from "./checkup-dialog";

export default function QuickActions() {
    const { onReset } = useChatContext() as ChatState;

    return (
        <div className='flex flex-wrap lg:flex-row xl:flex-col items-center xl:items-start gap-3.5'>
            <span className='w-full lg:w-auto md:text-lg font-medium text-slate-600'>Quick actions</span>
            <Button
                variant='ghost'
                onClick={onReset}
                className='h-[42px] xl:w-[180px] flex font-medium justify-start py-3 border border-slate-50'
            >
                <span className='text-lg mr-1 lg:mr-2'>🌱</span>
                New chat
            </Button>

            <CheckupDialog>
                <Button
                    variant='ghost'
                    className='h-[42px] xl:w-[180px] flex font-medium justify-start py-3 border border-slate-50'
                >
                    <span className='text-lg mr-1 lg:mr-2'>📝</span>
                    Portfolio review
                </Button>
            </CheckupDialog>

            <GetAdviceDialog>
                <Button
                    variant='ghost'
                    className='h-[42px] xl:w-[180px] flex font-medium justify-start py-3 border border-slate-50'
                >
                    <span className='text-lg mr-1 lg:mr-2'>📈</span>
                    Deposit/withdraw
                </Button>
            </GetAdviceDialog>
        </div>
    )
}