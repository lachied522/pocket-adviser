import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getUserById, updateUser } from "@/utils/crud/user";
import { getAdviceByUserId } from "@/utils/crud/advice";

import { H3 } from "@/components/ui/typography";

import AdviceArea from "./components/advice-area";
import AdviceTable from "./components/advice-table";

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

    const [adviceData, _] = await Promise.all([
        getAdviceByUserId(userId, 20),
        updateUser(userId, { dailyAdviceViewed: true }),
    ]);

    const dailyAdvice = adviceData[0];

    return (
        <div className='flex-1 p-3 overflow-y-scroll'>
            <div className='w-full max-w-6xl mx-auto pb-12'>
                <div className='flex flex-col gap-3'>
                    <H3>Inbox</H3>
                </div>

                <AdviceArea advice={dailyAdvice} />

                <AdviceTable data={adviceData.filter((advice) => advice.id !== dailyAdvice.id)} />
            </div>
        </div>
    )
}