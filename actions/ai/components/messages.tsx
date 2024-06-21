"use client";
import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function ChatMessage({ children }: { children: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="font-medium px-3 py-2">
                {children}
            </CardContent>
        </Card>
    )
}

export function LoadingMessage() {
    // return message to display when loading
    const [text, setText] = useState<string>('. ');

    useEffect(() => {
        const c = '. ';
        const interval = setInterval(() => {
            setText((s) => {
                return s==='. . . '? '. ': s + c;
            })
        }, 350);

        return () => {
            clearInterval(interval)
        }
    }, []);

    return (
        <ChatMessage>
            {text}
        </ChatMessage>
    )
}