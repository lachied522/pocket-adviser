import { Skeleton } from "@/components/ui/skeleton";
import { H3 } from "@/components/ui/typography";

export default function Loading() {


    return (
        <div className='flex-1 p-3 overflow-y-scroll'>
            <div className='w-full max-w-6xl mx-auto'>
                <div className='flex flex-col gap-3'>
                    <H3>Inbox</H3>
                </div>

                <div className='flex-1 flex flex-col gap-3 py-3'>
                    <p>Daily suggestions</p>
                    <Skeleton className='h-[480px] w-full' />
                </div>

                <div className='flex flex-col gap-3 py-12'>
                    <p>Older suggestions</p>
                    <Skeleton className='h-[480px] w-full' />
                </div>
            </div>
        </div>
    )
}