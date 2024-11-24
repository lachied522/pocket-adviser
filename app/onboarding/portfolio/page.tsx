import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getHoldingsByUserId } from "@/utils/crud/user";

import Portfolio from "./portfolio";

export default async function PortfolioPage() {
    // check for existing holdings
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    if (!userId) {
        // middleware should handle this
        redirect('/login');
    }

    const holdings = await getHoldingsByUserId(userId);

    return (
        <main className='h-screen flex items-center justify-center'>
            <Portfolio
                initialHoldings={holdings.map(
                    (holding) => ({
                        ...holding.stock,
                        id: holding.id,
                        stockId: holding.stockId,
                        units: holding.units,
                    })
                )}
            />
        </main>
    )
}