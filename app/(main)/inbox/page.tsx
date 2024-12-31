import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getUserById, updateUser } from "@/utils/crud/user";
import { getAdviceByUserId } from "@/utils/crud/advice";
import { getTodayMarketSummary } from "@/app/api/ai/market-summary";

import { H3 } from "@/components/ui/typography";

import AdviceArea from "./components/advice-area";
import AdviceTable from "./components/advice-table";
import MarketUpdate from "./components/market-update";
import NewsArea from "../(chat)/components/news-area";

export default async function InboxPage() {
    // check if userId is in cookies
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    if (!userId) {
        // middleware should handle this
        redirect('/login');
    }

    const user = await getUserById(userId);

    if (!user) redirect('/login');

    const [adviceData, marketUpdate, _] = await Promise.all([
        getAdviceByUserId(userId, 20),
        getTodayMarketSummary(),
        updateUser(userId, { dailyAdviceViewed: true }),
    ]);

    const dailyAdvice = adviceData[0];

    return (
        <>
            <NewsArea />
            <div className='flex-1 p-3 overflow-y-scroll'>
                <div className='w-full max-w-6xl flex flex-col gap-6 pb-12 mx-auto'>
                    <div className='flex flex-col gap-3'>
                        <H3>Welcome{user.name? ` ${user.name}`: ''}!</H3>
                    </div>

                    <MarketUpdate content={marketUpdate} />

                    <AdviceArea advice={dailyAdvice} />

                    <AdviceTable data={adviceData.filter((advice) => advice.id !== dailyAdvice.id)} />
                </div>
            </div>
        </>
    )
}