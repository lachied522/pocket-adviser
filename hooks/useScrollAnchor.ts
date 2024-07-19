import { useState, useEffect, useCallback, useRef } from "react";

export function useScrollAnchor() {
    // see https://github.com/vercel/ai-chatbot/blob/main/lib/hooks/use-scroll-anchor.tsx
    const [scrollHeight, setScrollHeight] = useState<number>(0);
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState(false);
    const messagesRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(
        () => {
            if (messagesRef.current) {
                messagesRef.current.scrollIntoView({
                    block: 'end',
                    behavior: 'smooth'
                });
            }
        },
        []
    );

    const hasHeightChanged = useCallback(
        () => {
            // scroll only if the scrollHeight of the messages has increased
            // inidicates a new message has been added
            return (messagesRef.current?.scrollHeight || 0) !== scrollHeight;
        },
        [scrollHeight]
    )

    useEffect(() => {
        if (hasHeightChanged()) {
            if (isAtBottom && !isVisible) {
                scrollToBottom();
            }
            setScrollHeight(messagesRef.current?.scrollHeight || 0);
        }
    }, [isAtBottom, isVisible, hasHeightChanged, setScrollHeight]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const handleScroll = (event: Event) => {
                const target = event.target as HTMLDivElement;
                const offset = 50;
                setIsAtBottom(target.scrollTop + target.clientHeight >= target.scrollHeight - offset);
            }
            
            scrollAreaRef.current.addEventListener('scroll', handleScroll);

            return () => {
                scrollAreaRef.current?.removeEventListener('scroll', handleScroll);
            }
        }
    }, []);

    useEffect(() => {
        if (anchorRef.current) {
            let observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        setIsVisible(entry.isIntersecting);
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
    });

    return {
        scrollAreaRef,
        messagesRef,
        anchorRef,
        scrollToBottom,
    }
}