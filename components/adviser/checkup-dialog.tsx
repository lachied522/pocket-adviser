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

import { type AdviserState, useAdviserContext } from "@/context/AdviserContext";

interface CheckupDialogProps {
    children: React.ReactNode
}

export default function CheckupDialog({ children }: CheckupDialogProps) {
    const { onSubmit } = useAdviserContext() as AdviserState;
    const closeRef = useRef<HTMLButtonElement>(null);

    const handleSubmit = () => {
        onSubmit("Can you provide some recommendations for my portfolio?");
        // close dialog
        if (closeRef.current) closeRef.current.click();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-w-xs'>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-2'>
                        🩺 Get a Portfolio Checkup
                    </DialogTitle>
                    <DialogDescription>
                        Review your portfolio and provide any recommendations.
                    </DialogDescription>
                </DialogHeader>

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