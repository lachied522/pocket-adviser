"use client";
import { useState, useCallback } from "react";

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
import { useSidebar } from "@/components/ui/sidebar";

import { useChatNavigation } from "@/hooks/useChatNavigation";

interface CheckupDialogProps {
    children: React.ReactNode
}

export default function CheckupDialog({ children }: CheckupDialogProps) {
    const { onSubmit } = useChatNavigation();
    const { setOpenMobile: setSidebarOpen } = useSidebar();
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleSubmit = useCallback(
        () => {
            onSubmit("Can you give me some trade ideas for my portfolio?", { toolName: "getRecommendations" });
            setIsOpen(false);
            setSidebarOpen(false);
        },
        [onSubmit, setIsOpen, setSidebarOpen]
    );

    return (
        <Dialog open={isOpen} onOpenChange={(value: boolean) => setIsOpen(value)}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-w-lg'>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-2'>
                        📝 Get a Portfolio Review
                    </DialogTitle>
                </DialogHeader>

                <p>Review your portfolio and provide actionable ideas.</p>

                <div className='h-full flex flex-row items-end justify-between'>
                    <DialogClose asChild>
                        <Button
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