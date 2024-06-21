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
import { Stethoscope } from "lucide-react";

interface CheckupDialogProps {
    children: React.ReactNode
    onSubmit: () => void
}

export default function CheckupDialog({ children, onSubmit }: CheckupDialogProps) {
    const closeRef = useRef<HTMLButtonElement>(null);

    const handleSubmit = () => {
        onSubmit();
        // close dialog
        if (closeRef.current) closeRef.current.click();
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-2'>
                        <Stethoscope />
                        Get a Portfolio Checkup
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