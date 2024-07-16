"use client";
import Image from "next/image";

import { format } from "date-fns";

import type { Calendar } from "@/utils/data/calendar";

interface CalendarItemProps {
    item: Calendar[number]
}

export default function CalendarItem({ item }: CalendarItemProps) {
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
        <div
            onDragStart={(e: React.DragEvent<HTMLElement>) => onDragStart(e, item)}
            draggable
            className='xl:w-full flex flex-col gap-2 p-2 border border-slate-50 cursor-pointer shrink-0 hover:scale-[1.05]'
        >
            <div className='flex flex-row items-center gap-1'>
                <Image
                    src={
                        'country' in item && item.country==="AU"? "/aus-flag-icon.png":
                        'symbol' in item && item.symbol.endsWith('.AX') ? "/aus-flag-icon.png":
                        "/us-flag-icon.png"
                    }
                    alt='flag'
                    height={16}
                    width={16}
                />
                <div className='text-sm font-medium'>{format(item.date, 'PP')}</div>
            </div>
            <div className='max-w-[180px] text-xs truncate'>
                {'symbol' in item? `Earnings: ${item.symbol}`: item.event}
            </div>
        </div>
    )
}