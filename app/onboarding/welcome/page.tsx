import { H1 } from "@/components/ui/typography";

import OnboardingChat from "./onboarding-chat";

export default function WelcomePage() {
    return (
        <main className='h-dvh flex flex-col overflow-hidden'>
            <div className='w-full max-w-6xl mx-auto py-6'>
                <H1>Welcome</H1>
            </div>

            <OnboardingChat />
        </main>
    )
}