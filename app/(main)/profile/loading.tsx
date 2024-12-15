import { Skeleton } from "@/components/ui/skeleton";
import { H3 } from "@/components/ui/typography";

export default function Loading() {
    return (
        <div className='flex-1 p-3 overflow-y-hidden'>
            <div className='w-full max-w-6xl mx-auto'>
                <div className='flex flex-col gap-3'>
                    <H3>My Profile</H3>
                    <p>Tell Pocket Adviser about yourself so it can provide accurate suggestions.</p>
                </div>

                <Skeleton className='h-screen w-full' />
            </div>
        </div>
    )
}