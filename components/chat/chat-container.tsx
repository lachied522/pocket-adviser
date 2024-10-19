
import { H3 } from "@/components/ui/typography";

import LeftSidebar from "./left-sidebar";
import ChatArea from "./chat-area";
import NewsCarousel from "./right-sidebar";

import type { Stock } from "@prisma/client";
import type { UserData } from "@/types/helpers";

interface ChatProps {
    initialUserData?: UserData|null
    initialStockData: { [id: number]: Stock }
}

export default function ChatContainer({ initialUserData, initialStockData }: ChatProps) {
    const symbols = initialUserData?.holdings.map(
        (holding) => initialStockData[holding.stockId].symbol
    ) || [];
    
    return (
        <div className='grid grid-cols-1 xl:grid-cols-[240px_1fr_240px] justify-start gap-2 xl:gap-6'>
            <div className='flex flex-col gap-3.5 md:gap-6 order-first'>
                <H3 className=''>My Adviser</H3>

                <LeftSidebar />
            </div>

            <ChatArea />

            <div className='xl:order-last'>
                <NewsCarousel symbols={symbols} />
            </div>
        </div>
    )
}