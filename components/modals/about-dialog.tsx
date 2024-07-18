
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { H3 } from "@/components/ui/typography";
import { ScrollArea } from "../ui/scroll-area";

interface AboutDialogProps {
    children: React.ReactNode
}

export default function AboutDialog({ children }: AboutDialogProps) {

    return (
        <Dialog>
            <DialogTrigger className='p-0' asChild>
                {children}
            </DialogTrigger>
            <DialogContent className='max-w-2xl'>
                <ScrollArea className='max-h-[80vh]'>
                    <div className='flex flex-col gap-6'>
                        <H3>About Pocket Adviser</H3>
                        <p>
                            Financial advice is incredibly important for building the future you want for yourself. Unfortunately, the <b>cost of financial advice</b> has risen significantly in recent years, making it inaccessible to most young people.
                            <br /><br />
                            Unfortunately, this means most people start their investing journey too late in life, leaving significant returns on the table due to the <a href="https://www.forbes.com/advisor/au/investing/compound-interest-in-australia/" target="_blank" className="underline text-sky-600">magic of compound interest</a>.
                            <br /><br />
                            Existing Robo Advisors solve this problem by offering managed investment portfolios. However, if you love the stock market, like me, this is no fun!
                            <br /><br />
                            I wanted to create a solution that utilises new AI technology for an <b>interactive</b> investing experience.
                            <br />
                        </p>
                        <H3>How It Works</H3>
                        <p>
                            Under the hood, Pocket Adviser uses a mathematical model to find an optimal portfolio of stocks based on a personalised utility function. The utility function is a variation of the <a href="https://www.investopedia.com/terms/t/treynorratio.asp" target="_blank" className="underline text-sky-600">Treynor Ratio</a>, which describes the excess portfolio return relative to risk.
                            <br /><br />
                            Pocket Adviser also has access to functions that allow it to search the web, read news articles, and retrieve stock data so that you can have an informed conversation.
                            <br />
                        </p>
                        <H3>About Me</H3>
                        <p>
                            My name is Lachie. I have Bachelor of Commerce and a Grad. Dip. of Financial Planning. I started investing in the stock market in my teens, and I created Pocket Adviser to give other young people confidence to invest in the market.
                            <br /><br />
                            I hope you find Pocket Adviser helpful, and encourage you to reach out if you have any queries or feature requests!
                            <br /><br />
                            <a href="mailto:lachie@pocketadviser.com.au" target="_blank" className="underline text-sky-600">lachie@pocketadviser.com.au</a>
                        </p>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}