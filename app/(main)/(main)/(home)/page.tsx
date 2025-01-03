import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getUserById, updateUser } from "@/utils/crud/user";
import { getAdviceByUserId } from "@/utils/crud/advice";
import { getTodayMarketSummary } from "@/app/api/ai/market-summary";

import { H3 } from "@/components/ui/typography";

import AdviceArea from "./components/advice-area";
import MarketUpdate from "./components/market-update";
import WelcomeDialog from "./components/welcome-dialog";
import LessonsProgress from "./components/lessons-progress";

const DEFAULT_USER_ID = "DEFAULT_USER";

async function getAdviceData(userId: string) {
    const advice = await getAdviceByUserId(userId, 20);

    if (advice.length > 0) {
        return advice;
    } 

    return await getAdviceByUserId(DEFAULT_USER_ID, 1);
}

export default async function HomePage({
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
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
        getAdviceData(userId),
        getTodayMarketSummary(),
        updateUser(userId, { dailyAdviceViewed: true }),
    ]);

    return (
        <>
            {searchParams?.welcome === "true" && <WelcomeDialog initialIsOpen={true} />}
            <div className='flex-1 p-3 overflow-y-scroll'>
                <div className='w-full max-w-6xl flex flex-col gap-6 mx-auto'>
                    <div className='flex flex-col gap-3'>
                        <H3>Welcome{user.name? ` ${user.name}`: ''}!</H3>
                    </div>

                    <MarketUpdate content={marketUpdate} />

                    <AdviceArea adviceData={adviceData} />

                    <div className='flex flex-col gap-2'>
                        <span className='font-medium'>Education</span>
            
                        <LessonsProgress />
                    </div>
                </div>
            </div>
        </>
    )
}