"use client";
import { useMemo } from "react";

import { CheckCheck } from "lucide-react";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import type { Lesson, LessonGroup } from "./helpers";
import Link from "next/link";

interface LessonsProgressProps {
    lessonGroups: LessonGroup[]
}

export default function LessonsProgress({ lessonGroups }: LessonsProgressProps) {
    const { state } = useGlobalContext() as GlobalState;

    const [progress, currentLesson] = useMemo(() => {
        let totalLessons = 0;
        const completed = Object.values(state.lessons ?? {})
        .reduce((acc, value) => acc + (value === "completed"? 1: 0), 0);

        let currentLesson: Lesson | null = null;
        const currentLessonSlug = Object.entries(state.lessons ?? {}).find(([_, value]) => value === "in-progress")?.[0];

        // get total number of lesson and find the current lesson
        for (const group of lessonGroups) {
            for (const lesson of group.lessons) {
                if (lesson.slug === currentLessonSlug) {
                    currentLesson = lesson;
                }

                totalLessons++;
            }
        }

        if (!currentLesson) currentLesson = lessonGroups[0].lessons[0];

        return [completed / totalLessons, currentLesson]
    }, [state.lessons, lessonGroups]);

    return (
        <div className='flex flex-col gap-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-12'>
                <div className='flex flex-col gap-3'>
                    {lessonGroups.map((group) => (
                    <div key={`lesson-group-${group.number}`} className='flex flex-col gap-3'>
                        <span className='text-xl'>{group.title}</span>
                        <span className='text-sm'>{group.lessons.reduce((acc, obj) => acc + ((state.lessons as any)?.[obj.slug] === "completed"? 1: 0), 0)}/{group.lessons.length} complete</span>

                        <div className='flex flex-col gap-3 py-3'>
                            {group.lessons
                            .map((lesson) => (
                            <Link key={`lesson-${lesson.slug}`} href={`/education/${lesson.slug}`}>
                                <Button
                                    variant='ghost'
                                    className='h-10 w-full flex flex-row items-center justify-start gap-3'
                                >
                                    <div className='size-8 flex items-center justify-center'>
                                        {(state.lessons as any)?.[lesson.slug] === "completed" && (
                                        <CheckCheck size={22} className='text-green-400' />
                                        )}
                                    </div>
                                    <span>{lesson.frontmatter.title}</span>
                                </Button>
                            </Link>
                            ))}
                        </div>

                        <Separator className='my-6' />
                    </div>
                    ))}
                </div>

                <div className='hidden sm:flex flex-col gap-6'>
                    <div className='flex flex-col gap-3 py-3'>
                        <span>Pick up where you left off:</span>

                        <div className='flex flex-row items-center justify-between gap-3'>
                            <span className='font-medium text-lg'>{currentLesson.frontmatter.title}</span>
                            <Link href={`/education/${currentLesson.slug}`}>
                                <Button>Continue</Button>
                            </Link>
                        </div>
                    </div>

                    <div className='flex flex-col gap-3'>
                        <span className='text-xl'>{(progress * 100).toFixed(0)}% complete</span>
                        <Progress value={progress * 100} />
                    </div>
                </div>
            </div>
        </div>
    )
}