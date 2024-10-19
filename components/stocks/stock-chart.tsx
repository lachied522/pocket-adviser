"use client";
import { useEffect, useRef, memo } from 'react';

import type { Stock } from '@prisma/client';

function formatSymbol(symbol: string, exchange:'ASX'|'NASDAQ'|'NYSE') {
    // tradingview symbols are prefixed with exchange, e.g. ASX:BHP or NASDAQ:AAPL
    switch (exchange) {
        case 'ASX': {
            const parts = symbol.split('.');
            symbol = 'ASX:' + parts[0];
            break;
        }
        case 'NASDAQ': {
            symbol = 'NASDAQ:' + symbol;
            break;
        }
        case 'NYSE': {
            symbol = 'NYSE:' + symbol;
            break;
        }
        default:
            // pass
    }

    return symbol;
}

function StockChart({ stockData }: { stockData: Omit<Stock, 'id'> }) {
    // see https://www.tradingview.com/widget-docs/widgets/charts/mini-chart/
    let mountedRef = useRef<boolean>(false); // useEffect triggers twice in dev mode
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(
        () => {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
                {
                    "autosize": true,
                    "symbol": "NASDAQ:AAPL",
                    "interval": "D",
                    "timezone": "Etc/UTC",
                    "theme": "light",
                    "style": "1",
                    "locale": "en",
                    "hide_top_toolbar": true,
                    "hide_legend": true,
                    "allow_symbol_change": false,
                    "save_image": false,
                    "calendar": false,
                    "support_host": "https://www.tradingview.com"
                }
            `;
            if (!mountedRef.current && containerRef.current) containerRef.current.appendChild(script);
            mountedRef.current = true;
        },
        [stockData]
    );

    return (
        <div className="tradingview-widget-container" ref={containerRef}>
            <div className="tradingview-widget-container__widget"></div>
            <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
        </div>
    );
}

export default memo(StockChart);