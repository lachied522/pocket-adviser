
import { H3 } from "@/components/ui/typography";

import QuickActions from "./quick-actions";
import ChatArea from "./chat-area";
import NewsCarousel from "./news-carousel";
import Calendar from "./calendar";

import type { Stock } from "@prisma/client";
import type { UserData } from "@/types/helpers";

interface ChatProps {
    initialUserData?: UserData|null
    initialStockData: { [id: number]: Stock }
}

export default function Chat({ initialUserData, initialStockData }: ChatProps) {
    const symbols = initialUserData?.holdings.map(
        (holding) => initialStockData[holding.stockId].symbol
    ) || [];
    return (
        <div className='grid grid-cols-1 xl:grid-cols-[240px_1fr_240px] justify-start gap-3 xl:gap-6'>
            <div className='grid grid-cols-1 auto-rows-min gap-3 xl:gap-6 order-first'>
                <H3 className=''>My Adviser</H3>

                <QuickActions />
                
                <Calendar symbols={symbols} />
            </div>

            <ChatArea />

            <div className='xl:order-last'>
                <NewsCarousel symbols={symbols} />
            </div>
        </div>
    )
}