

interface ImageWithCaptionProps extends React.HTMLAttributes<HTMLImageElement> {
    caption: string
}


export default function ImageWithCaption(props: ImageWithCaptionProps) {
    return (
        <div className='flex flex-col items-center justify-center'>
            <img
                {...props}
            />
            <div className='text-center'>
                {props.caption}
            </div>
        </div>
    )
}