"use client";
import { useState, useEffect } from "react";

export function useMediaQuery(minSize: number = 768) {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        // add event listener for obtaining screen width
        const handleResize = () => {
            setIsMobile(window.innerWidth < minSize);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize)
        };
    }, []);

    return isMobile;
}