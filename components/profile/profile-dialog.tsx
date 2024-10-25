
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import ProfileTabs from "./profile-tabs";

interface ProfileDialogProps {
    children: React.ReactNode
}

export default function ProfileDialog({ children }: ProfileDialogProps) {

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-w-6xl'>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-1'>
                        Profile
                    </DialogTitle>
                </DialogHeader>

                <ProfileTabs />
            </DialogContent>
        </Dialog>
    )
}