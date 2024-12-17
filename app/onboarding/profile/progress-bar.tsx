
import { cn } from "@/components/utils";

import { STEPS } from "./steps";

interface ProgressBarProps {
    currentStep: number
}

export default function ProgressBar({ currentStep }: ProgressBarProps) {
    return (
        <div className='h-3 w-full flex flex-row border border-black rounded-xl'>
            {STEPS.map((step, index) => (
                <div
                    key={`progress-indicator-${index}`}
                    className='flex-1 flex relative'
                >
                    <div
                        className={cn(
                            'flex-1',
                            index < STEPS.length - 1 && 'border-r border-black',
                            index <= currentStep && 'bg-black',
                            index === 0 && 'rounded-l-xl',
                            index === STEPS.length -1 && 'rounded-r-xl'
                        )}
                    />

                    {/* @ts-ignore: TO DO */}
                    {step.marker && (
                    <div className='p-1 absolute right-0 translate-y-4 translate-x-[50%]'>
                        {/* @ts-ignore: TO DO */}
                        <span className='text-xs line-clamp-1'>{step.marker}</span>
                    </div>
                    )}
                </div>
            ))}
        </div>
    )
}