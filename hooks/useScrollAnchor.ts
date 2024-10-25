import { useState, useEffect, useCallback, useRef } from "react";

export function useScrollAnchor() {
    // see https://github.com/vercel/ai-chatbot/blob/main/lib/hooks/use-scroll-anchor.tsx
    const [shouldAutoScroll, setShouldAutoScroll] = useState<boolean>(false);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null); // placeholder element at bottom of scroll area
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null); // timeout for handling scroll delay

    const scrollToBottom = useCallback(
        () => {
            if (anchorRef.current) {
                anchorRef.current.scrollIntoView({
                    block: 'nearest',
                    behavior: 'smooth'
                });
            }
        },
        []
    );

    useEffect(() => {
        if (shouldAutoScroll && !isAtBottom) {
            scrollToBottom();
        }
    }, [isAtBottom, shouldAutoScroll, scrollToBottom]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const handleScroll = (event: Event) => {
                const target = event.target as HTMLDivElement;
                const offset = 50;
                setShouldAutoScroll(target.scrollTop + target.clientHeight >= target.scrollHeight - offset);
            }
            
            scrollAreaRef.current.addEventListener('scroll', handleScroll);

            return () => {
                scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
            }
        }
    }, []);

    useEffect(() => {
        if (anchorRef.current) {
            // set shouldAutoScroll if anchor is not in view
            let observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        setIsAtBottom(entry.isIntersecting);
                    })
                },
                {
                    rootMargin: '0px 0px -150px 0px'
                }
            );
        
            observer.observe(anchorRef.current);
        
            return () => {
                observer.disconnect();
            }
        }
    }, []);

    return {
        scrollAreaRef,
        anchorRef,
        setShouldAutoScroll,
    }
}