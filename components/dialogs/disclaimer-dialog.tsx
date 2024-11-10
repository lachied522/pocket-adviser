
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface DisclaimerDialogProps {
    children: React.ReactNode
}

export default function DisclaimerDialog({ children }: DisclaimerDialogProps) {

    return (
        <Dialog>
            <DialogTrigger className='p-0' asChild>
                { children }
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
                <div className='m-auto'>
                    <p className='text-sm'>
                        <span id='disclaimer' className='text-lg font-medium'>Disclaimer</span>
                        <br /><br />
                        Pocket Adviser is for educational purposes only.
                        Any information or ideas presented by Pocket Adviser are not intended to be formal financial advice.
                        The decision to buy or sell securities lies with you, and we do not take responsibility for the outcome of such decisions.
                        Please consult a certified financial advisor if you require advice.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}