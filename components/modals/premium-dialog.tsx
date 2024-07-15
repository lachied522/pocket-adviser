
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { H1, H3 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import SubscribeButton from "./subscribe-button";

interface PremiumDialogProps {
    children: React.ReactNode
}


export default function PremiumDialog({ children }: PremiumDialogProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                { children }
            </DialogTrigger>
            <DialogContent className='max-w-2xl max-h-full md:max-h-[90vh] overflow-auto'>
                <H3>Pocket Adviser Premium</H3>

                <div className='max-w-[400px] flex flex-col gap-2 p-5 bg-sky-50 border-2 border-sky-600 rounded-lg'>
                    <div className='flex flex-row items-end justify-between gap-10'>
                        <div className=''>
                            <div>Price <span className='text-sm'>(USD)</span></div>
                            <div className='inline-flex items-end'>
                                <H1>$10</H1>
                                <span className='text-lg text-slate-600 ml-1 mb-0.5'>/month</span>
                            </div>
                        </div>
                        <div className='w-full flex justify-end'>
                            <SubscribeButton />
                        </div>
                    </div>

                    <span>Includes:</span>
                    <ul className='list-disc list-inside pl-3'>
                        <li><b>Unlimited</b> chat requests</li>
                        <li><b>Unlimited</b> portfolio reviews</li>
                        <li><b>New!</b> Personalised newsletter</li>
                    </ul>
                </div>

                <H3>Personal Newsletter</H3>
                <p>
                    Premium subscribers can opt-in to receive a personalised newsletter on a daily, weekly, or monthly basis! The newsletter includes:
                </p>
                <div className='grid grid-cols-[24px_1fr] items-start gap-x-2 pl-3 *:font-medium'>
                    <div className=''>💡</div>
                    <div className=''>Trade Ideas</div>
                    <div className=''>📈</div>
                    <div className=''>Portfolio Update</div>
                    <div className=''>📋</div>
                    <div className=''>General Market Update</div>
                    <div className=''>🔍</div>
                    <div className=''>Stock Specific Updates</div>
                </div>
                
                <span className='text-lg font-medium'>Preview</span>
                <ScrollArea className='h-[480px] px-3'>
                    <div className='border border-slate-50 rounded-lg relative p-5'>
                        {/* <div className='z-10 absolute inset-0 bg-gradient-to-b from-transparent to-white/80 from-30%'/> */}
                        <p>
                            <span>Good morning Lachie,</span>
                            <br /><br />
                            Below is your daily newsletter from Pocket Adviser. Happy investing!
                            <br /><br />
                        </p>
                        <h3 className='text-lg font-bold'>Trade Ideas</h3>
                        <table className='w-full border-collapse font-medium text-sm mt-3.5'>
                            <thead className='bg-slate-100 border border-slate-100 text-left'>
                                <tr className='*:p-2'>
                                    <td>Transaction</td>
                                    <td>Symbol</td>
                                    <td>Name</td>
                                    <td>Units</td>
                                    <td>Price</td>
                                    <td>Value</td>
                                </tr>
                            </thead>

                            <tbody className='bg-white border border-slate-100 text-left'>
                                <tr className='*:border *:border-slate-100 *:text-left *:p-2'>
                                    <td>📈 <b>Buy</b></td>
                                    <td>SMCI</td>
                                    <td>Super Micro Computer, Inc.</td>
                                    <td>2</td>
                                    <td>$899.98</td>
                                    <td>$1,799.96</td>
                                </tr>
                                <tr className='*:border *:border-slate-100 *:text-left *:p-2'>
                                    <td>📈 <b>Buy</b></td>
                                    <td>CVX</td>
                                    <td>Chevron Corporation</td>
                                    <td>9</td>
                                    <td>$155.13</td>
                                    <td>$1,396.17</td>
                                </tr>
                                <tr className='*:border *:border-slate-100 *:text-left *:p-2'>
                                    <td>📈 <b>Buy</b></td>
                                    <td>SQ2.AX</td>
                                    <td>Block, Inc.</td>
                                    <td>15</td>
                                    <td>$95.70</td>
                                    <td>$1,435.50</td>
                                </tr>
                                <tr className='*:border *:border-slate-100 *:text-left *:p-2'>
                                    <td>📈 <b>Buy</b></td>
                                    <td>CRM</td>
                                    <td>Salesforce, Inc.</td>
                                    <td>6</td>
                                    <td>$252.59</td>
                                    <td>$1,515.54</td>
                                </tr>
                                <tr className='*:border *:border-slate-100 *:text-left *:p-2'>
                                    <td>📉 <b>Sell</b></td>
                                    <td>Meta</td>
                                    <td>Meta Platforms, Inc.</td>
                                    <td>11</td>
                                    <td>$534.69</td>
                                    <td>$5,881.59</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className='whitespace-pre-wrap mt-6'>
                            <h3 className='text-lg font-bold'>Stock Market Update: Navigating Uncertainty and Opportunities 🌐📊</h3>
                            <br />
                            The stock market is currently navigating through a period of uncertainty and mixed signals. As of November 2023, the S&P 500 has been trading lower for three consecutive months, a trend not seen since March 2020. This decline is largely attributed to investor concerns over the Federal Reserve&apos;s interest rate policies and the broader economic outlook. The Federal Reserve recently decided to maintain the federal funds rate at 5.25% to 5.5%, a key factor influencing the market&apos;s recent performance.
                            <br /><br />
                            Despite the downturn, there is a sense of cautious optimism among investors. Historically, the fourth quarter has been one of the best three-month stretches for the S&P 500, and many are hopeful that the market can regain its bullish momentum. The third quarter of 2023 showed positive earnings growth for the S&P 500, the first such growth since the third quarter of 2022, providing some encouragement.
                            <br /><br />
                            Economic indicators present a mixed picture. U.S. gross domestic product (GDP) grew by 4.9% in the third quarter, exceeding expectations, but there are signs that economic growth may slow in the coming months. The U.S. personal savings rate has dropped, and rising credit card debt and delinquencies could signal a potential slowdown in consumer spending.
                            <br /><br />
                            In the technology sector, companies like NVIDIA have seen significant gains due to their involvement in artificial intelligence (AI) and other high-growth areas. However, high interest rates and tight credit markets are impacting other sectors differently, with some experiencing declines in earnings.
                            <br /><br />
                            Overall, while the market faces challenges, there are also opportunities for growth, particularly in sectors like technology and healthcare. Investors are advised to stay informed and consider a diversified approach to navigate the current volatility. 📈💼
                            <br /><br />
                            ...
                        </p>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}