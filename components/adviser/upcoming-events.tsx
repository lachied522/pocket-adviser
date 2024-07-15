"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

import { format } from "date-fns";

import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { type Calendar, getCalendarAction } from "@/actions/data/calendar";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

export default function UpcomingEvents() {
    const { state, getStockData } = useGlobalContext() as GlobalState;
    const [data, setData] = useState<Calendar|null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        (async function getNews() {
            setIsLoading(true);
            const symbols = [];
            if (state && state.holdings) {
                for (const holding of state.holdings) {
                    const { symbol } = await getStockData(holding.stockId);
                    symbols.push(symbol);
                }
            }
            const _data = await getCalendarAction(symbols);
            // update state
            setData(_data.slice(0, 12));
            setIsLoading(false);
        })();
    }, [getStockData]);

    const onDragStart = (e: React.DragEvent<HTMLElement>, obj: Calendar[number]) => {
        const input = (
            'symbol' in obj? `What can I expect from ${obj.symbol}'s earnings on ${obj.date}`:
            `Can you tell me about the upcoming ${obj.event} and the potential impacts on my portfolio?`
        );
        // set data transfer
        e.dataTransfer.setData("text/plain", JSON.stringify({
            input,
        }));
    }

    return (
        <div className='h-full flex flex-col items-stretch gap-2 xl:gap-3.5'>
            <div className='flex flex-row items-center xl:flex-col xl:items-start gap-x-1 gap-y-2'>
                <h4 className='text-lg font-medium text-slate-600'>Upcoming</h4>
                {data && data.length > 0 && <div className='text-xs text-slate-600'>Tip: drag an event into the chat</div>}
            </div>

            <ScrollArea className=''>
                <div className='xl:h-[380px] flex flex-row xl:flex-col items-center py-3 xl:px-3 xl:py-0 gap-3.5'>
                    {isLoading ? (
                    <>
                        {Array.from({length: 12}).map((_, index) => (
                        <Skeleton
                            key={`event-skelton-${index}`}
                            className='h-[64px] w-full mx-2 shrink-0'
                        />
                        ))}
                    </>
                    ) : (
                    <>
                        {data && data.length > 0? (
                        <>
                            {data.map((obj, index) => (
                                <div
                                    key={`event-${index}`}
                                    onDragStart={(e: React.DragEvent<HTMLElement>) => onDragStart(e, obj)}
                                    draggable
                                    className='w-full flex flex-col gap-2 p-2 border border-slate-50 cursor-pointer hover:scale-[1.05]'
                                >
                                    <div className='flex flex-row items-center gap-1'>
                                        <Image
                                            src={
                                                'country' in obj && obj.country==="AU"? "/aus-flag-icon.png":
                                                'symbol' in obj && obj.symbol.endsWith('.AX') ? "/aus-flag-icon.png":
                                                "/us-flag-icon.png"
                                            }
                                            alt='flag'
                                            height={16}
                                            width={16}
                                        />
                                        <div className='text-sm font-medium'>{format(obj.date, 'PP')}</div>
                                    </div>
                                    <div className='max-w-[180px] text-xs truncate'>
                                        {'symbol' in obj? `Earnings: ${obj.symbol}`: obj.event}
                                    </div>
                                </div>
                            ))}
                        </>
                        ) : (
                        <div>
                            No events found.
                        </div>
                        )}
                    </>
                    )}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    )
}