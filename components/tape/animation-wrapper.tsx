"use client";
import { motion } from "framer-motion";

interface AnimationWrapperProps {
    children: React.ReactNode
}

export default function AnimationWrapper({ children }: AnimationWrapperProps) {
    return (
        <motion.div
            animate={{
                translateX: '-100%',
                transition: {
                    ease: "linear",
                    repeat: Infinity,
                    duration: 60,
                }
            }}
            className='flex flex-row items-center gap-3.5'
        >
            {children}
        </motion.div>
    )
}