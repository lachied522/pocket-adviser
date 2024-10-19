import { CircleHelp } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface UtilityDialogProps {
    children: React.ReactNode
}

export default function UtilityDialog({ children }: UtilityDialogProps) {

    return (
        <Dialog>
            <DialogTrigger>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='flex flex-row items-center gap-1'>
                        <CircleHelp size={20} /> Utility
                    </DialogTitle>
                </DialogHeader>

                <p>Utility in the context of investment and finance refers to a measure of the satisfaction or benefit that an investor derives from their portfolio. It&apos;s a concept used to assess the desirability of a particular set of investments based on the investor&apos;s risk tolerance, return expectations, and other preferences.</p>
                <p></p>
                <p>Pocket Adviser uses a variation of the Treynor Ratio to calculate your utility. This means Pocket Adviser will attempt to maximise the expected return of your portfolio relative to risk.</p>
            </DialogContent>
        </Dialog>
    )
}