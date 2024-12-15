import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getHoldingsWithStocks } from "@/utils/crud/holding";

import { H3 } from "@/components/ui/typography";

import { PortfolioProvider } from "./context";
import Portfolio from "./components/portfolio";

async function getHoldingsData(userId: string) {
    const data = await getHoldingsWithStocks(userId);

    const holdings = [];
    const stocks = [];

    for (const obj of data) {
        const { stock, ...holding } = obj;
        holdings.push(holding);
        stocks.push(stock);
    }

    return { holdings, stocks };
}

export default async function PortfolioPage() {
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    if (!userId) {
        redirect('/login');
    }

    const { holdings, stocks } = await getHoldingsData(userId);

    return (
        <PortfolioProvider initialHoldings={holdings} initialStocks={stocks}>
            <div className='flex-1 p-3 overflow-y-auto'>
                <div className='w-full max-w-6xl flex flex-col mx-auto'>
                    <div className='flex flex-col gap-3'>
                        <H3>My Portfolio</H3>
                        <p>If you own stocks with a broker, you can keep your portfolio up to date here to ensure Pocket Adviser provides accurate suggestions.</p>
                    </div>

                    <Portfolio />
                </div>
            </div>
        </PortfolioProvider>
    )
}