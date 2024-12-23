import { ArrowBigUp } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Loading() {
    return (
        <div className='flex-1 w-full max-w-7xl flex flex-col pb-6 mx-auto overflow-hidden'>
            <div className='max-h-full h-full flex flex-col justify-start gap-3 px-3 sm:px-6 py-3 scroll-smooth'>
                <div className='h-48 w-full flex pt-7 lg:pr-24'>
                    <Skeleton className='flex-1 bg-zinc-200 rounded-xl' />
                </div>
                <div className='h-10 w-full flex lg:pl-24'>
                    <Skeleton className='flex-1 bg-zinc-200 rounded-xl' />
                </div>
                <div className='h-48 w-full flex lg:pr-24'>
                    <Skeleton className='flex-1 bg-zinc-200 rounded-xl' />
                </div>
                <div className='h-10 w-full flex lg:pl-24'>
                    <Skeleton className='flex-1 bg-zinc-200 rounded-xl' />
                </div>
                <div className='h-48 w-full flex lg:pr-24'>
                    <Skeleton className='flex-1 bg-zinc-200 rounded-xl' />
                </div>
            </div>

            <div className='w-full flex flex-col justify-center gap-3 pt-3'>
                <span className='text-xs text-center'>Please double-check important information and contact a financial adviser if you require advice.</span>
                
                <div className='w-full flex flex-row gap-1'>
                    <div className="h-12 flex-1 flex flex-row border border-zinc-100 rounded-l-md overflow-hidden">
                        <Input
                            disabled
                            placeholder='Ask me something!'
                            className='h-full w-full text-base font-medium bg-zinc-100 border-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                        />
                    </div>

                    <Button
                        disabled
                        className="h-full aspect-square p-0"
                    >
                        <ArrowBigUp size={24} strokeWidth={2} color="white"/>
                    </Button>
                </div>
            </div>
        </div>
    )
}