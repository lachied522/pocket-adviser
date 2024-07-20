import { CircleFadingPlus, ClipboardList, MessageCircleMore } from "lucide-react";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WelcomeDialogProps {
    openRef: React.RefObject<HTMLButtonElement>
}

export default function WelcomeDialog({ openRef }: WelcomeDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    ref={openRef}
                    className='hidden'
                >
                    Welcome
                </Button>
            </DialogTrigger>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()} // prevent closing dialog on outside click
                className='max-w-lg'
            >
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-1'>
                        Welcome
                    </DialogTitle>
                </DialogHeader>

                <p>Hello! 👋</p>
                <p>Welcome to Pocket Adviser! I am your AI stock market copilot, here to assist you on your investing journey.</p>
                <p>I can help you find investments that fit your objectives and preferences, explain financial concepts, and navigate market events.</p>
                <p>Get started in <b>three easy steps</b>.</p>

                <div className='grid grid-cols-1 sm:grid-cols-3 place-items-center gap-2 my-3'>
                    <div className='w-[280px] sm:w-auto flex flex-row sm:flex-col items-center gap-3.5 md:gap-2 px-2 py-3 border-2 border-slate-200 rounded-xl'>
                        <ClipboardList size={48} strokeWidth={1.5} />
                        <span className='font-medium text-left sm:text-center'>1. Adjust your profile</span>
                    </div>

                    <div className='w-[280px] sm:w-auto flex flex-row sm:flex-col items-center gap-3.5 md:gap-2 px-2 py-3 border-2 border-slate-200 rounded-xl'>
                        <CircleFadingPlus size={48} strokeWidth={1.5} />
                        <span className='font-medium text-left sm:text-center'>2. Add stocks to your portfolio</span>
                    </div>

                    <div className='w-[280px] sm:w-auto flex flex-row sm:flex-col items-center gap-3.5 md:gap-2 px-2 py-3 border-2 border-slate-200 rounded-xl'>
                        <MessageCircleMore size={48} strokeWidth={1.5} />
                        <span className='font-medium text-left sm:text-center'>3. Start a discussion!</span>
                    </div>
                </div>

                <DialogClose asChild>
                    <Button>
                        Get Started
                    </Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    )
}