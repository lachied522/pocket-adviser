import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {


    return (
        <div className='flex-1 p-3 overflow-y-scroll'>
            <div className='w-full max-w-6xl mx-auto'>
                <Skeleton className='h-[480px] w-full' />
            </div>
        </div>
    )
}