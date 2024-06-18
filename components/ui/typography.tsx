import { cn } from "@/components/utils";

interface HeadingProps extends React.HTMLProps<HTMLHeadingElement>{};
interface TextProps extends React.HTMLProps<HTMLParagraphElement>{};

const H1 = ({ className, ...props }: HeadingProps) => {
    return (
        <h1
            className={cn('text-3xl font-semibold', className)}
            {...props}
        />
    )
}

H1.displayName = 'H1';

const H3 = ({ className, ...props }: HeadingProps) => {
    return (
        <h3
            className={cn('text-xl font-semibold', className)}
            {...props}
        />
    )
}

H3.displayName = 'H3';

const Text = ({ className, ...props }: TextProps) => {
    return (
        <p
            className={cn('text-base font-medium', className)}
            {...props}
        />
    )
}

Text.displayName = 'p';

export { H1, H3, Text };