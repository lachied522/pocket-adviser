import { useState, useEffect, useCallback, useRef } from "react";

export function useScrollAnchor() {
    // see https://github.com/vercel/ai-chatbot/blob/main/lib/hooks/use-scroll-anchor.tsx
    const [isAtBottom, setIsAtBottom] = useState<boolean>(true);
    const [isVisible, setIsVisible] = useState(false);
    const messagesRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollIntoView({
                block: 'end',
                behavior: 'smooth'
            });
        }
    }, []);

    useEffect(() => {
        if (isAtBottom && !isVisible) {
            scrollToBottom();
        }
    }, [isAtBottom, isVisible, scrollToBottom]);

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

    useEffect(() => {
        if (anchorRef.current) {
            let observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            setIsVisible(true);
                        } else {
                            setIsVisible(false);
                        }
                    })
                },
                {
                    rootMargin: '0px 0px -200px 0px'
                }
            );
        
            observer.observe(anchorRef.current);
        
            return () => {
                observer.disconnect();
            }
        }
    });

    return {
        messagesRef,
        scrollAreaRef,
        anchorRef,
        scrollToBottom,
    }
}