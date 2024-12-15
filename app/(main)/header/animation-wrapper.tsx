"use client";
import { useEffect, useCallback, useRef } from "react";
import { motion, animate, useMotionValue } from "framer-motion";

interface AnimationWrapperProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function AnimationWrapper({ children, className }: AnimationWrapperProps) {
    const x = useMotionValue("0%");
    const animationRef = useRef<ReturnType<typeof animate>>();

    const startAnimation = useCallback(() => {
        const animation = animate(
            x,
            `${Number(x.get().replace('%', '')) - 100}%`,
            {
                ease: "linear",
                duration: 60,
                repeat: Infinity,
            }
        );
        animationRef.current = animation;
    }, []);

    const stopAnimation = () => {
        if (animationRef.current) animationRef.current.stop();
    }

    // start animation on component mount
    useEffect(() => {
        startAnimation();
    }, [startAnimation]);

    return (
        <motion.div
            style={{x}}
            // onHoverStart={stopAnimation}
            // onHoverEnd={startAnimation}
            className={className}
        >
            {children}
        </motion.div>
    )
}