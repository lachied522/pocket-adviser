import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import CalendarItem from "./calendar-item";

import { type Calendar, getCalendar } from "@/utils/financial_modelling_prep/calendar";

function CalendarSkeleton() {
    return (
        <ScrollArea className=''>
            <div className='xl:h-[380px] flex flex-row xl:flex-col items-center py-3 xl:px-3 xl:py-0 gap-3.5'>
                {Array.from({length: 12}).map((_, index) => (
                <Skeleton
                    key={`event-skelton-${index}`}
                    className='h-[64px] w-full mx-2 shrink-0'
                />
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    )
}

interface CalendarProps {
    symbols: string[]
}

async function CalendarBody({ symbols }: CalendarProps) {
    const data = await getCalendar(symbols);
    return (
        <div className='h-full flex flex-col items-stretch gap-2 xl:gap-3.5'>
            <div className='flex flex-row items-center xl:flex-col xl:items-start gap-x-1 gap-y-2'>
                <h4 className='md:text-lg font-medium text-slate-600'>Upcoming</h4>
                {data && data.length > 0 && <div className='hidden md:block text-xs text-slate-600'>Tip: drag an event into the chat</div>}
            </div>

            <ScrollArea className=''>
                <div className='xl:h-[380px] flex flex-row xl:flex-col items-center pb-3 xl:px-3 xl:py-0 gap-2'>
                    {data && data.length > 0? (
                    <>
                        {data.map((item, index) => (
                        <CalendarItem key={`calendar-item-${index}`} item={item} />
                        ))}
                    </>
                    ) : (
                    <div>
                        No events found.
                    </div>
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}

export default function Calendar({ symbols }: CalendarProps) {
    return (
        <Suspense fallback={<CalendarSkeleton />}>
            <CalendarBody symbols={symbols} />
        </Suspense>
    )
}