import Image from "next/image";

interface LogoProps {
    width?: number
    height?: number
    withText?: boolean
}

export function Logo({
    width = 40,
    height = 40,
    withText = false
}: LogoProps) {

    return (
        <div className='flex flex-row items-center gap-6'>
            <Image
                src='/pocket-adviser-logo-white.png'
                alt='Pocket Adviser Logo'
                width={width}
                height={height}
            />
            {withText && <h1 className='font-semibold text-3xl text-white cursor-default'>Pocket Adviser</h1>}
        </div>
    )
}