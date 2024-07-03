"use client";
import Image from "next/image";

import { cn } from "@/components/utils";

import type { StockNews } from "@/types/api";

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

    const handleDragStart = (e: React.DragEvent<HTMLElement>, article: StockNews) => {
        // set data transfer
        e.dataTransfer.setData("text/plain", JSON.stringify(article));
    }

    return (
        <a
            key={`article-${article.title}`}
            href={article.url}
            target="_blank"
            draggable={draggable}
            onDragStart={(e: React.DragEvent<HTMLAnchorElement>) => handleDragStart(e, article)}
            className="flex flex-col items-center justify-start p-2"
        >
            <div className={cn("h-24 md:h-36 w-36 md:w-48 rounded-xl relative overflow-hidden cursor-pointer", animateOnHover && "hover:scale-[1.05]")}>
                <Image
                    src={article.image}
                    alt="Article Image"
                    fill
                    sizes="192px"
                    style={{
                        objectFit: "cover"
                    }}
                />
                <div className="z-10 flex-1 flex flex-col justify-end bg-gradient-to-b from-transparent to-black absolute inset-0">
                    <div className="flex flex-col px-3 py-2">
                        <span className="text-xs md:text-sm text-white font-medium line-clamp-1">{article.title}</span>
                        <span className="text-xs text-white line-clamp-2">{article.text}</span>
                    </div>
                </div>
            </div>
        </a>
    )
}