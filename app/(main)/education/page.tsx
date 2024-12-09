import { GraduationCap } from "lucide-react";

import { Separator } from "@/components/ui/separator";

import { getLessonsByGroup } from "./helpers";
import LessonsProgress from "./lessons-progress";

export default function EducationPage() {
    return (
        <div className='flex-1 overflow-hidden'>
            <div className='h-full overflow-y-auto'>
                <div className='max-w-4xl mx-auto p-3'>
                    <div className='flex flex-row items-center gap-3 mb-1'>
                        <GraduationCap />
                        <h2 className='text-2xl font-medium'>
                            Pocket Adviser Education
                        </h2>
                    </div>
                    <h3>How to Consistently Grow Your Wealth With Stocks</h3>

                    <Separator className='my-6' />

                    <LessonsProgress lessonGroups={getLessonsByGroup()} />
                </div>
            </div>
        </div>
    )
}