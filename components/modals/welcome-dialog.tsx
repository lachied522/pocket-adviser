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
            <DialogContent className='max-w-lg'>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-1'>
                        Welcome
                    </DialogTitle>
                </DialogHeader>

                <p>Hello! 👋</p>
                <p>Welcome to Pocket Adviser! Pocket Adviser is your personal stock market guide to assist you on your investing journey.</p>
                <p>Pocket Adviser can help you find investments that fit your objectives and preferences, explain financial concepts, and navigate market events.</p>
                <p>Get started in <b>three easy steps</b>.</p>

                <div className='grid grid-cols-3 gap-2 mt-6'>
                    <div className='flex flex-col items-center gap-2 px-2 py-3 border-2 border-slate-200 rounded-xl'>
                        <ClipboardList size={48} strokeWidth={1.5} />
                        <span className='font-medium text-center'>1. Adjust your profile</span>
                    </div>
                    <div className='flex flex-col items-center gap-2 px-2 py-3 border-2 border-slate-200 rounded-xl'>
                        <CircleFadingPlus size={48} strokeWidth={1.5} />
                        <span className='font-medium text-center'>2. Add stocks to your portfolio</span>
                    </div>
                    <div className='flex flex-col items-center gap-2 px-2 py-3 border-2 border-slate-200 rounded-xl'>
                        <MessageCircleMore size={48} strokeWidth={1.5} />
                        <span className='font-medium text-center'>3. Chat with your adviser</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}