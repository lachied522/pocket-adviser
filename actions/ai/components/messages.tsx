"use client";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function ChatMessage({ content }: { content: string }) {
    return (
        <Card>
            <CardContent className="font-medium px-3 py-2 whitespace-pre-wrap">
                {content}
            </CardContent>
        </Card>
    )
}

export function LoadingMessage({ msg }: { msg?: string }) {
    // return message to display when loading
    const [ellipsis, setEllipsis] = useState<string>('. ');

    useEffect(() => {
        const c = '. ';
        const interval = setInterval(() => {
            setEllipsis((s) => {
                return s==='. . . '? '. ': s + c;
            })
        }, 350);

        return () => {
            clearInterval(interval)
        }
    }, []);

    return (
        <ChatMessage content={(msg? msg: "Thinking") + ellipsis} />
    )
}