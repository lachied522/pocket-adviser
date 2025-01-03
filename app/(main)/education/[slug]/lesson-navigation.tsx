import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { allLessons } from "content-collections";

import { Button } from "@/components/ui/button";

import CompleteAndContinueButton from "./complete-and-continue";

interface LessonNavigationProps {
    slug: string
}

export default function LessonNavigation({ slug }: LessonNavigationProps) {
    const sortedLessons = allLessons
        .filter((lesson) => lesson.lesson !== undefined)
        .sort((a, b) => a.lesson! - b.lesson!);

    const index = sortedLessons.findIndex((lesson) => lesson._meta.path === slug);

    const nextLesson = index < sortedLessons.length - 1? sortedLessons[index + 1]._meta.path: null;
    const previousLesson = index > 0? sortedLessons[index - 1]._meta.path: null;

    return (
        <div className='w-full sm:w-auto flex flex-row items-center justify-between sm:justify-end gap-3 py-2'>
            {previousLesson && (
            <Link href={`/education/${previousLesson}`}>
                <Button
                    variant="secondary"
                    size="sm"
                    disabled={!previousLesson}
                >
                    <ChevronLeft size={12} />
                    Previous Lesson
                </Button>
            </Link>
            )}

            {nextLesson && (
            <CompleteAndContinueButton
                lesson={sortedLessons[index]?._meta.path}
                nextLesson={nextLesson}
            />
            )}
        </div>
    )
}