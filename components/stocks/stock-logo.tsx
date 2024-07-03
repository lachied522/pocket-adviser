import Image from "next/image";

const BASE_URL = "https://financialmodelingprep.com/image-stock/";

interface StockLogoProps {
    symbol: string
    height?: number
    width?: number
}

export default function StockLogo({
    symbol,
    height = 120,
    width = 120,
}: StockLogoProps) {

    // remove .AX
    if (symbol.endsWith('.AX')) {
        symbol = symbol.split('.').slice(0, 1).join('');
    }

    return (
        <div className='h-36 w-36 flex items-center justify-center shrink-0 bg-slate-100 rounded-xl p-3'>
            {symbol ? (
            <Image
                src={BASE_URL + symbol + ".png"}
                alt={symbol + " logo"}
                height={height}
                width={width}
            />
            ) : (
            <div className='h-full w-full flex items-center justify-center text-sm'>
                Logo not found
            </div>
            )}
        </div>
    )
}