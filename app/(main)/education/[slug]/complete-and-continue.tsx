"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { updateUserAction } from "@/actions/crud/user";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

import { Button } from "@/components/ui/button";

interface CompleteAndContinueButtonProps {
    lesson: string
    nextLesson: string
}

export default function CompleteAndContinueButton({
    lesson,
    nextLesson,
}: CompleteAndContinueButtonProps) {
    const { state, completeLesson } = useGlobalContext() as GlobalState;
    return (
        <Link href={`/education/${nextLesson}`}>
            <Button
                size="sm"
                onClick={() => {
                    const lessons = {
                        ...state.lessons as any, // TO DO: type this properly
                        [lesson]: "completed",
                        [nextLesson]: "in-progress",
                    };
                    updateUserAction(state.id, { lessons });
                    completeLesson(lesson);
                }}
            >
                Complete and continue
                <ChevronRight size={12} />
            </Button>
        </Link>
    )
}