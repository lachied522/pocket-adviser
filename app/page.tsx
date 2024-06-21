import { H3 } from "@/components/ui/typography";
import Container from "@/components/ui/container";

import Header from "@/components/ui/header";
import ProfileTabs from "@/components/profile/profile-tabs";
import ChatArea from "@/components/adviser/chat-area";
import Portfolio from "@/components/portfolio/portfolio";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export default function Page() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className='flex flex-col gap-7 pb-24'>
        <div className='bg-slate-50 px-6'>
          <Container className='p-3.5'>
            <ProfileTabs />
          </Container>
        </div>

        <div className='px-6 mb-24'>
          <Container className='p-7 border border-slate-200 rounded-xl'>
            <ChatArea />
          </Container>
        </div>

        <div className='px-6'>
          <Container className='flex flex-col gap-6 p-7 border border-slate-200 rounded-xl'>
            <Portfolio />
          </Container>
        </div>
      </div>
    </main>
  )
}