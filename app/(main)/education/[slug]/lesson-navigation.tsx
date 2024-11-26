import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getAllLessons } from "./helpers";

interface LessonNavigationProps {
    slug: string
}

export default function LessonNavigation({ slug }: LessonNavigationProps) {
    const lessons = getAllLessons();

    const currentLesson = lessons.findIndex((lesson) => lesson.slug === slug);

    const nextLesson = currentLesson < lessons.length - 1? lessons[currentLesson + 1].slug: null;
    const previousLesson = currentLesson > 0? lessons[currentLesson - 1].slug: null;

    return (
        <div className='w-full flex flex-row items-center justify-end gap-3 py-2'>
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
            <Link href={`/education/${nextLesson}` || ''}>
                <Button
                    size="sm"
                    disabled={!nextLesson}
                >
                    Next Lesson
                    <ChevronRight size={12} />
                </Button>
            </Link>
            )}
        </div>
    )
}