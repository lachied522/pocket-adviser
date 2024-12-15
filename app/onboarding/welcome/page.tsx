import { H1 } from "@/components/ui/typography";


export default function WelcomePage() {




    return (
        <main className='min-h-screen flex items-center justify-center bg-white'>
            <div className='w-full max-w-6xl flex flex-col items-stretch justify-center gap-6 p-12 mx-auto'>
                <H1>Welcome</H1>

                <div className='w-full flex flex-row justify-between'>
                    <p>
                        Hello! 👋
                        <br /><br />
                        Welcome to Pocket Adviser! I am your AI stock market copilot, here to assist you on your investing journey.
                        <br />
                        I can help you find investments that fit your objectives and preferences, explain financial concepts, and navigate market events.
                        <br />
                        Get started in <b>three easy steps</b>.
                    </p>
                </div>
            </div>
        </main>
    )
}