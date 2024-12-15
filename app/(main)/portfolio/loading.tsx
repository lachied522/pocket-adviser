import { Skeleton } from "@/components/ui/skeleton";
import { H3 } from "@/components/ui/typography";

export default function Loading() {
    return (
        <div className='flex-1 p-3 overflow-y-hidden'>
            <div className='w-full max-w-6xl flex flex-col mx-auto'>
                <div className='flex flex-col gap-3'>
                    <H3>My Portfolio</H3>
                    <p>If you own stocks with a broker, you can keep your portfolio up to date here to ensure Pocket Adviser provides accurate suggestions.</p>
                </div>

                <Skeleton className='h-screen w-full' />
            </div>
        </div>
    )
}