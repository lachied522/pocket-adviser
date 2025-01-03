import { cn } from "@/components/utils";

interface ImageWithCaptionProps extends React.HTMLAttributes<HTMLImageElement> {
    caption: string
    href?: string
}

export default function ImageWithCaption({ caption, href, ...props }: ImageWithCaptionProps) {
    return (
        <a href={href} target="_blank" className='flex flex-col items-center justify-center gap-2'>
            <img
                className='max-h-[960px]'
                {...props}
            />
            <div className={cn('text-center', href && 'text-sky-600 underline')}>
                {caption}
            </div>
        </a>
    )
}