import { cookies } from "next/headers";
import Link from "next/link";

import { Check, Home } from "lucide-react";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { H1, H3 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

import SubscribeButton from "./subscribe-button";

export default async function PricingPage() {
    // check if userId is in cookies
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    return (
        <>
            <main className='min-h-screen bg-slate-50'>
                <div className='w-full max-w-6xl flex flex-col gap-6 py-6 mx-auto'>
                    <div className='w-full flex flex-row items-center justify-end gap-3'>
                        {userId ? (
                        <Link href='/'>
                            <Button
                                variant='outline'
                                size='sm'
                                className='h-7 md:h-9'
                            >
                                <span className='text-xs md:text-sm'>Dashboard</span>
                            </Button>
                        </Link>
                        ) : (
                        <>
                            <Link href='/login'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='h-7 md:h-9'
                                >
                                    <span className='text-xs md:text-sm'>Login</span>
                                </Button>
                            </Link>

                            <Link href='/signup'>
                                <Button
                                    size='sm'
                                    className='h-7 md:h-9 border border-input shadow-sm'
                                >
                                    <span className='text-xs md:text-sm'>Signup</span>
                                </Button>
                            </Link>
                        </>
                        )}
                    </div>

                    <div className='p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
                        <div className='flex flex-col gap-3'>
                            <H1>Compare Plans</H1>
                            <div className='h-fit flex flex-col sm:flex-row items-stretch justify-center gap-3 my-12'>
                                <div className='flex-1 sm:max-w-[300px] flex flex-col gap-6 p-3 sm:p-5 bg-white border-2 border-sky-600 rounded-lg'>
                                    <H1>Free</H1>
                                    <div className=''>
                                        <div>Price <span className='text-sm'>(USD)</span></div>
                                        <div className='inline-flex items-end'>
                                            <H1>$0</H1>
                                            <span className='text-lg text-slate-600 ml-1 mb-0.5'>/month</span>
                                        </div>
                                    </div>
                                    <Button
                                        disabled
                                        className='w-full'
                                    >
                                        Create free account
                                    </Button>
                                    <div>
                                        <div className='mb-3'>Includes:</div>
                                        <div className='grid grid-cols-[24px_1fr] gap-x-2'>
                                            <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                            <div><b>Up to 12</b> chat requests / day</div>
                                            <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                            <div><b>1 free</b> advice request / day</div>
                                        </div>
                                    </div>
                                </div>
                                <div className='flex-1 sm:max-w-[300px] flex flex-col gap-6 p-3 sm:p-5 bg-sky-50 border-2 border-sky-600 rounded-lg'>
                                    <H1>Premium</H1>
                                    <div className=''>
                                        <div>Price <span className='text-sm'>(USD)</span></div>
                                        <div className='inline-flex items-end'>
                                            <H1>$10</H1>
                                            <span className='text-lg text-slate-600 ml-1 mb-0.5'>/month</span>
                                        </div>
                                    </div>
                                    <SubscribeButton userId={userId} />
                                    <div>
                                        <div className='mb-3'>Includes:</div>
                                        <div className='grid grid-cols-[24px_1fr] gap-x-2'>
                                            <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                            <div><b>Unlimited</b> chat requests</div>
                                            <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                            <div><b>Unlimited</b> advice requests</div>
                                            <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                            <div>More personalised conversations with Notes 📝</div>
                                            <Check size={16} color='rgb(22 163 74)' className='mt-1' />
                                            <div>Daily/weekly market updates straight to your inbox (see below)</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                
                    <div className='p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
                        <div className='flex flex-col gap-3 mb-12'>
                            <H1>Pocket Adviser Newsletter</H1>
                            <p>Premium subscribers can opt-in to receive a personalised newsletter on a daily, weekly, or monthly basis! The newsletter includes:</p>
                            <div className='grid grid-cols-[24px_1fr] items-start gap-x-2 sm:pl-3 *:font-medium'>
                                <div className=''>💡</div>
                                <div className=''>Trade Ideas</div>
                                <div className=''>📈</div>
                                <div className=''>Portfolio Update</div>
                                <div className=''>📋</div>
                                <div className=''>General Market Update</div>
                                <div className=''>🔍</div>
                                <div className=''>Stock Specific Updates</div>
                            </div>
                            <p>Preview the newsletter below.</p>
                        </div>
                        <div className='max-w-6xl border border-slate-50 rounded-lg relative p-2 sm:p-5 mx-auto'>
                            <p>
                                <span>Good morning Lachie,</span>
                                <br /><br />
                                Below is your daily newsletter from Pocket Adviser. Happy investing!
                                <br /><br />
                            </p>
                            <h3 className='text-lg font-bold'>Trade Ideas</h3>
                            <div className='max-w-[calc(90vw-30px)] overflow-x-auto mb-6'>
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
                            </div>
                            <h3 className='text-lg font-bold'>Stock Market Update: Navigating Uncertainty and Opportunities 🌐📊</h3>
                            <p className='whitespace-pre-wrap'>
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
                    </div>
                    <div className='p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
                        <div className='flex flex-col gap-6'>
                            <H1>Frequently Asked Questions</H1>
                            <div className='flex flex-col gap-6 my-6'>
                                <div className='flex flex-col gap-3'>
                                    <H3>How does Pocket Adviser work?</H3>
                                    <p>
                                        Pocket Adviser uses a proprietary algorithm to optimise your portfolio and provides recommended transactions by comparing it to your current portfolio.
                                        AI is used to deliver these transactions to you in a conversational and interactive way, but is not responsible for generating them.
                                    </p>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <H3>Do I need my own brokerage account?</H3>
                                    <p>
                                        No. Pocket Adviser provides recommendations without linking to your brokerage account. It is your responsibility to keep Pocket Adviser up to date with your portfolio.
                                    </p>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <H3>Can I cancel or change my subscription anytime?</H3>
                                    <p>Yes! You can cancel your subscription through the 'Billing' option in your dashboard.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}