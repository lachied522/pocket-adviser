import { Pencil, ExternalLink } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";

export default function Loading() {
    return (
        <div className='flex-1 p-3 overflow-y-hidden'>
            <div className='w-full max-w-6xl flex flex-col gap-3 mx-auto'>
                <div className='w-full flex flex-row items-center justify-between gap-3'>
                    <div className='flex flex-col gap-2'>
                        <H3>My Profile</H3>
                        <p className='text-sm'>Tell Pocket Adviser about yourself so it can provide accurate suggestions.</p>
                    </div>

                    <div className='flex flex-row items-center gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            disabled
                            className='flex flex-row gap-2 justify-start'
                        >
                            <Pencil size={13} />
                            Edit manually
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            disabled
                            className='flex flex-row gap-2 justify-start'
                        >
                            Take survey
                            <ExternalLink size={13} />
                        </Button>
                    </div>
                </div>

                <Skeleton className='h-screen w-full' />
            </div>
        </div>
    )
}