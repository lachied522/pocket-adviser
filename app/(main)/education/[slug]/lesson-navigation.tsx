import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { getAllLessons } from "../helpers";
import CompleteAndContinueButton from "./complete-and-continue";

interface LessonNavigationProps {
    slug: string
}

export default function LessonNavigation({ slug }: LessonNavigationProps) {
    const lessons = getAllLessons();

    const index = lessons.findIndex((lesson) => lesson.slug === slug);

    const nextLesson = index < lessons.length - 1? lessons[index + 1].slug: null;
    const previousLesson = index > 0? lessons[index - 1].slug: null;

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
                lesson={lessons[index].slug}
                nextLesson={nextLesson}
            />
            )}
        </div>
    )
}