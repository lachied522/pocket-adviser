
import { H3 } from "@/components/ui/typography";

import NewsCarousel from "./news-carousel";
import QuickActions from "./quick-actions";
import UpcomingEvents from "./upcoming-events";
import ChatArea from "./chat-area";

export default function Chat() {
    return (
        <div className='grid grid-cols-1 xl:grid-cols-[240px_1fr_240px] justify-start gap-3 xl:gap-6'>
            <div className='grid grid-cols-1 auto-rows-min gap-3 xl:gap-6 order-first'>
                <H3 className=''>My Adviser</H3>

                <QuickActions />

                <UpcomingEvents />
            </div>

            <ChatArea />

            <div className='xl:order-last'>
                <NewsCarousel />
            </div>
        </div>
    )
}