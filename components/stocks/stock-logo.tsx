"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

import { Skeleton } from "@/components/ui/skeleton";

const BASE_URL = "https://financialmodelingprep.com/image-stock/";

async function getImageBlur(symbol: string) {
    let url = BASE_URL + symbol + ".png";

    const res = await fetch(url);
    
    if (!res.ok) {
        // sometimes '.AX' suffix must be removed for ASX stocks
        if (symbol.endsWith('.AX')) {
            // try again with suffix removed
            symbol = symbol.split('.')[0];
            return getImageBlur(symbol);
        }
    }

    return {
        url,
        buffer: Buffer.from(await res.arrayBuffer()).toString("base64"),
    }
}

interface StockLogoProps {
    symbol: string
    height?: number
    width?: number
    fill?: boolean
}

export default function StockLogo({
    symbol,
    height = 110,
    width = 110,
    fill = false,
}: StockLogoProps) {
    const [src, setSrc] = useState<string|null>(null);
    const [imageBlur, setImageBlur] = useState<string|null>(null);
    
    useEffect(() => {
        getImageBlur(symbol)
        .then(({ url, buffer }) => {
            setSrc(url);
            setImageBlur(buffer);
        });
    }, [symbol]);

    return (
        <>
            {src ? (
            <Image
                src={src}
                alt={symbol + " logo"}
                fill={fill}
                height={!fill? height: undefined}
                width={!fill? width: undefined}
                sizes="110px"
                // blurDataURL={`data:image/png;base64,${imageBlur}`}
                // placeholder="blur"
            />
            ) : (
            <Skeleton
                className='bg-slate-200'
                style={{ ...(fill? {}: { height, width }) }}
            />
            )}
        </>
    )
}