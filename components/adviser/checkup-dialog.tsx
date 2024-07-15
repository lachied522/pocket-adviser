"use client";
import { useRef } from "react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { type ChatState, useChatContext } from "@/context/ChatContext";

interface CheckupDialogProps {
    children: React.ReactNode
}

export default function CheckupDialog({ children }: CheckupDialogProps) {
    const { onSubmit } = useChatContext() as ChatState;
    const closeRef = useRef<HTMLButtonElement>(null);

    const handleSubmit = () => {
        onSubmit("Can you give me some trade ideas for my portfolio?", "getRecommendations");
        // close dialog
        if (closeRef.current) closeRef.current.click();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='h-64 max-w-sm'>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-2'>
                        📝 Get a Portfolio Review
                    </DialogTitle>
                </DialogHeader>

                <p>Review your portfolio and provide actionable ideas.</p>

                <div className='h-full flex flex-row items-end justify-between'>
                    <DialogClose asChild>
                        <Button
                            ref={closeRef}
                            type='button'
                            variant='secondary'
                        >
                            No thanks
                        </Button>
                    </DialogClose>

                    <Button onClick={handleSubmit}>
                        Yes please
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}