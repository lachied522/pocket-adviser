import { Link, Pencil } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";

export default function Loading() {
    return (
        <div className='flex-1 p-3 overflow-y-hidden'>
            <div className='w-full max-w-6xl flex flex-col gap-3 mx-auto'>
                <div className='w-full flex flex-row items-center justify-between gap-3'>
                    <div className='flex flex-col gap-2'>
                        <H3>My Portfolio</H3>
                        <p className='text-sm'>If you own stocks with a broker, you can keep your portfolio up to date here to ensure Pocket Adviser provides accurate suggestions.</p>
                    </div>

                    <div className='flex flex-row items-center gap-2'>
                        <Button
                            variant='outline'
                            size='sm'
                            className='flex flex-row gap-2 justify-start'
                            disabled
                        >
                            <Link size={13} />
                            Link broker
                        </Button>

                        <Button
                            variant='outline'
                            size='sm'
                            className='flex flex-row gap-2 justify-start'
                            disabled
                        >
                            <Pencil size={13} />
                            Edit portfolio
                        </Button>
                    </div>
                </div>

                <Skeleton className='h-screen w-full' />
            </div>
        </div>
    )
}