"use client";
import { useState } from "react";

import { CircleFadingPlus, MessageCircleMore, UserRound } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WelcomeDialogProps {
    initialIsOpen: boolean
}

export default function WelcomeDialog({ initialIsOpen }: WelcomeDialogProps) {
    const [isOpen, setIsOpen] = useState<boolean>(initialIsOpen);
    return (
        <Dialog open={isOpen} onOpenChange={(value: boolean) => setIsOpen(value)}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()} // prevent closing dialog on outside click
                className="max-w-xl"
            >
                <DialogHeader>
                    <DialogTitle>
                        Welcome
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className='max-h-[75vh] sm:max-h-[80vh]'>
                    <p>Hello! 👋</p>
                    <br />
                    <p>Welcome to Pocket Adviser! I am your AI stock market copilot, here to assist you on your investing journey.</p>
                    <br />
                    <p>I can help you find investments that fit your objectives and preferences, explain financial concepts, and navigate market events.</p>
                    <br />
                    <p>Get started in <b>three easy steps</b>.</p>

                    <div className='grid grid-cols-1 sm:grid-cols-3 place-items-center gap-3 px-3 py-6'>
                        <div className='w-full sm:w-auto sm:max-w-max flex flex-row sm:flex-col items-center gap-3.5 md:gap-2 px-2 py-3 border-2 border-zinc-200 rounded-xl'>
                            <UserRound strokeWidth={1.5} className='h-full w-auto min-w-6' />
                            <span className='font-medium text-left sm:text-center'>1. Adjust your profile</span>
                        </div>

                        <div className='w-full sm:w-auto sm:max-w-max flex flex-row sm:flex-col items-center gap-3.5 md:gap-2 px-2 py-3 border-2 border-zinc-200 rounded-xl'>
                            <CircleFadingPlus strokeWidth={1.5} className='h-full w-auto min-w-6' />
                            <span className='font-medium text-left sm:text-center'>2. Add stocks to your portfolio</span>
                        </div>

                        <div className='w-full sm:w-auto sm:max-w-max flex flex-row sm:flex-col items-center gap-3.5 md:gap-2 px-2 py-3 border-2 border-zinc-200 rounded-xl'>
                            <MessageCircleMore strokeWidth={1.5} className='h-full w-auto min-w-6' />
                            <span className='font-medium text-left sm:text-center'>3. Start a discussion!</span>
                        </div>
                    </div>
                </ScrollArea>

                <DialogClose asChild>
                    <Button>
                        Get Started
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}