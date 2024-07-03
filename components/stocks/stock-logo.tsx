import Image from "next/image";

const BASE_URL = "https://financialmodelingprep.com/image-stock/";

interface StockLogoProps {
    symbol: string
    height?: number
    width?: number
}

export default function StockLogo({
    symbol,
    height = 110,
    width = 110,
}: StockLogoProps) {

    return (
        <>
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
        </>
    )
}