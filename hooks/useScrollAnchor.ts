import { useState, useEffect, useCallback, useRef } from "react";

export function useScrollAnchor() {
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (anchorRef.current) {
            anchorRef.current.scrollIntoView({
                block: 'end',
                behavior: 'smooth'
            });
        }
    }, []);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const handleScroll = (event: Event) => {
            const target = event.target as HTMLDivElement;
            const offset = 25;
            setIsAtBottom(target.scrollTop + target.clientHeight >= target.scrollHeight - offset);
        }

        scrollAreaRef.current.addEventListener('scroll', handleScroll, {
            passive: true
        });

        return () => {
            scrollAreaRef.current?.removeEventListener('scroll', handleScroll)
        }
        }
    }, []);


    return {
        scrollAreaRef,
        anchorRef,
        scrollToBottom,
    }
}