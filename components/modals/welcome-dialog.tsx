
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
                <p>Welcome to Pocket Adviser! Pocket Adviser was created to be a guide for young investors as they get started on their investing journeys.</p>
                <p>Pocket Adviser can help you find investments that fit your objectives and preferences, explain financial concepts, and navigate market events.</p>
            </DialogContent>
        </Dialog>
    )
}