
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { H3 } from "@/components/ui/typography";

interface AboutDialogProps {
    children: React.ReactNode
}

export default function AboutDialog({ children }: AboutDialogProps) {

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <H3>About Pocket Adviser</H3>

                <p>
                    Financial advice is incredibly important for building the future you want for yourself. Unfortunately, the cost of financial advice has risen significantly in recent years, making it inaccessible to most young people.
                    Unfortunately, this means most people start their investing journey too late in life, leaving significant returns on the table due to the power of compound interest. 📈
                    <br /><br />
                    Existing robo-advice products solve this problem by offering managed investment portfolios. However, these products do not involve the investor in the decision-making process, which is no fun! 😴
                    <br /><br />
                    I created Pocket Adviser as a way of encouraging you to get involved in the stock market...
                </p>
                <H3>How It Works</H3>
                <p>
                    Under the hood, Pocket Adviser uses a mathematical model to find an optimal portfolio of stocks based on a personalised utility function. The utility function is a variation of the <a href="https://www.investopedia.com/terms/t/treynorratio.asp" target="_blank" className="underline text-sky-600">Treynor Ratio</a>, which describes the excess portfolio return relative to risk.
                    <br /> <br />
                </p>
            </DialogContent>
        </Dialog>
    )
}