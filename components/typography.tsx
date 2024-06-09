import { cn } from "@/lib/utils";

interface ComponentProps extends React.HTMLProps<HTMLHeadingElement>{};

const H1 = ({ className, ...props }: ComponentProps) => {
    return (
        <h1
            className={cn('text-3xl font-medium', className)}
            {...props}
        />
    )
}

H1.displayName = 'H1';

const H3 = ({ className, ...props }: ComponentProps) => {
    return (
        <h3
            className={cn('text-xl font-medium', className)}
            {...props}
        />
    )
}

H3.displayName = 'H1';

export { H1, H3 };