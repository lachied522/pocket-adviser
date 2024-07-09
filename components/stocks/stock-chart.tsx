"use client";
import { useEffect, useRef, memo } from 'react';

function formatSymbol(symbol: string) {
    // tradingview symbols are prefixed with exchange, e.g. ASX:BHP or NASDAQ:AAPL
    if (symbol.includes('.AX')) {
        const parts = symbol.split('.');
        symbol = 'ASX:' + parts[0];
    } else {
        symbol = 'NASDAQ:' + symbol;
    }
    console.log(symbol);
    return symbol;
}

function StockSchart({ symbol }: { symbol: string }) {
    // see https://www.tradingview.com/widget-docs/widgets/charts/mini-chart/
    let mountedRef = useRef<boolean>(false); // useEffect triggers twice in dev mode
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(
        () => {
            const script = document.createElement("script");
            script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
            script.type = "text/javascript";
            script.async = true;
            script.innerHTML = `
                {
                    "symbol": "${formatSymbol(symbol)}",
                    "width": "100%",
                    "height": "100%",
                    "locale": "en",
                    "dateRange": "12M",
                    "colorTheme": "light",
                    "trendLineColor": "rgba(71, 85, 105, 1)",
                    "isTransparent": false,
                    "autosize": true,
                    "largeChartUrl": "",
                    "chartOnly": true
                }
            `;
            if (!mountedRef.current && containerRef.current) containerRef.current.appendChild(script);
            mountedRef.current = true;
        },
        [symbol]
    );

    return (
        <div className="tradingview-widget-container" ref={containerRef}>
            <div className="tradingview-widget-container__widget"></div>
            <div className="tradingview-widget-copyright"><a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span className="blue-text">Track all markets on TradingView</span></a></div>
        </div>
    );
}

export default memo(StockSchart);