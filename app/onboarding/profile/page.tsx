import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import ProfileChat from "./profile-chat";

export default function WelcomePage({
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    if (!userId) {
        redirect('/login');
    }

    const isNewUser = typeof searchParams?.new === "string";

    return (
        <main className='h-dvh flex flex-col overflow-hidden'>
            <ProfileChat
                userId={userId}
                isNewUser={isNewUser}
            />
        </main>
    )
}