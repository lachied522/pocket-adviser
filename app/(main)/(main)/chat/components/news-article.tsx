"use client";
import { useCallback } from "react";
import Image from "next/image";

import { cn } from "@/components/utils";

import type { StockNews } from "@/utils/financial_modelling_prep/types";

interface NewsArticleProps {
    article: StockNews
    draggable?: boolean
    animateOnHover?: boolean
}

export default function NewsArticle({
    article,
    draggable = false,
    animateOnHover = false,
}: NewsArticleProps) {

    const onDragStart = useCallback(
        (e: React.DragEvent<HTMLElement>) => {
            // set data transfer
            e.dataTransfer.setData("text/plain", JSON.stringify({
                input: "Can you tell me about this article and the potential impacts on my portfolio?",
                article,
            }));
        },
        [article]
    );  

    return (
        <>
            {article.image && (
            <a
                href={article.url}
                target="_blank"
                draggable={draggable}
                onDragStart={onDragStart}
                className={cn("flex flex-col items-center justify-start", animateOnHover && "p-1")}
            >
                <div className={cn("h-24 xl:h-28 w-36 xl:w-44 rounded-lg relative overflow-hidden cursor-pointer", animateOnHover && "hover:scale-[1.05]")}>
                    {/** 
                     * Use regular img tag here.
                     * Next JS Image results in error for source not being configured even though it is??
                     *  */ }
                    <img
                        src={article.image}
                        alt="Article Image"
                        sizes="160px"
                        style={{
                            objectFit: "cover"
                        }}
                    />
                    <div className="z-10 flex-1 flex flex-col justify-end bg-gradient-to-b from-transparent to-black absolute inset-0">
                        <div className="flex flex-col px-3 py-2">
                            <span className="text-xs xl:text-sm text-white font-medium line-clamp-1">{article.title}</span>
                            <span className="text-xs text-white line-clamp-2">{article.text}</span>
                        </div>
                    </div>
                </div>
            </a>
            )}
        </>
    )
}