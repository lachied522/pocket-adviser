"use client";
import { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";

import { Plus, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { H3 } from "@/components/ui/typography";
import { cn } from "@/components/utils";


export default function NewsCarousel() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-row items-center gap-3.5 -translate-x-[46px]'>
                <Button
                    variant='ghost'
                    onClick={() => setIsOpen(!isOpen)}
                    className='h-8 w-8 p-0'
                >
                    {isOpen? (
                    <Minus size={24} strokeWidth={2} />
                    ) : (
                    <Plus size={24} strokeWidth={2} />
                    )}
                </Button>
                <H3 className=''>News</H3>
            </div>

            <AnimatePresence>
                {isOpen && (
                <motion.div
                    key='news-carousel'
                    initial={{ opacity: 0, height: 0, y: -300 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -300 }}
                    transition={{
                        ease: "easeOut",
                        duration: 0.10,
                    }}
                    className='flex overflow-x-auto'
                >
                    {Array.from({ length: 24 }).map((_, index) => (
                    <div key={index} className="pl-6 shrink-0 grow-0 basis-1/4 lg:basis-1/6">
                        <div className="p-1">
                            <Card>
                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                    <span className="text-2xl font-semibold">{index + 1}</span>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    ))}
                </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
