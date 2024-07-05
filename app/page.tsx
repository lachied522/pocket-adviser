import Image from "next/image";

import Container from "@/components/ui/container";
import Header from "@/components/ui/header";
import ProfileTabs from "@/components/profile/profile-tabs";
import TrendingStocks from "@/components/trending/trending-stocks";
import ChatArea from "@/components/adviser/chat-area";
import Portfolio from "@/components/portfolio/portfolio";
import Footer from "@/components/ui/footer";

// Force the page to be dynamic and allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export default function Page() {
  return (
    <main className='min-h-screen relative'>
      {/* Background Image */}
      <div className='z-[-1] absolute inset-0 opacity-40 bg-slate-300'>
            <Image
              src='/background-image-main.jpg'
              alt='background-image'
              fill
              style={{
                objectFit: 'cover',
              }}
            />
      </div>

      <Header />

      <div className='bg-slate-50/80 px-6 shadow-sm'>
        <Container className='p-3.5'>
          <ProfileTabs />
        </Container>
      </div>

      <div className='flex flex-col gap-6 xl:gap-10 py-6 xl:py-10'>
      <div className='px-3 sm:px-6'>
          <Container className='p-3.5 bg-white border border-slate-200 rounded-xl'>
            <TrendingStocks />
          </Container>
        </div>

        <div className='px-3 sm:px-6'>
          <Container className='p-3.5 md:p-7 bg-white border border-slate-200 rounded-xl'>
            <ChatArea />
          </Container>
        </div>

        <div className='px-3 sm:px-6'>
          <Container className='flex flex-col gap-6 p-7 bg-white border border-slate-200 rounded-xl'>
            <Portfolio />
          </Container>
        </div>
      </div>

      <Footer />
    </main>
  )
}