"use client";
import { useMemo } from "react";
import Link from "next/link";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import type { LessonGroup } from "@/app/(main)/education/helpers";
import { Card, CardContent } from "@/components/ui/card";

interface LessonsProgressProps {
    lessonGroups: LessonGroup[]
}

export default function LessonsProgress({ lessonGroups }: LessonsProgressProps) {
    const { state } = useGlobalContext() as GlobalState;

    const [progress, currentLesson] = useMemo(() => {
        let totalLessons = 0;
        const completed = Object.values(state.lessons ?? {})
        .reduce((acc, value) => acc + (value === "completed"? 1: 0), 0);

        let currentLesson: LessonGroup["lessons"][number] | null = null;
        const currentLessonSlug = Object.entries(state.lessons ?? {}).find(([_, value]) => value === "in-progress")?.[0];

        // get total number of lesson and find the current lesson
        for (const group of lessonGroups) {
            for (const lesson of group.lessons) {
                if (lesson._meta.path === currentLessonSlug) {
                    currentLesson = lesson;
                }

                totalLessons++;
            }
        }

        if (!currentLesson) currentLesson = lessonGroups[0].lessons[0];

        return [completed / totalLessons, currentLesson]
    }, [state.lessons, lessonGroups]);

    return (
        <div className='max-w-2xl w-full flex flex-col items-stretch gap-6 mx-auto'>
            <span>Progress</span>
            <div className='flex flex-row items-center gap-3 p-3 sm:p-6'>
                <div className='shrink-0 text-sm'>{(progress * 100).toFixed(0)}% complete</div>
                <Progress value={Math.max(progress * 100, 1)} />
            </div>

            <span>Pick up where you left off</span>
            <div className='p-3 sm:p-6'>
                <Card>
                    <CardContent>
                        <div className='flex flex-row items-center justify-between gap-3'>
                            <span className='font-medium'>{currentLesson.title}</span>
                            <Link href={`/education/${currentLesson._meta.path}`}>
                                <Button size="dynamic">Continue</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}