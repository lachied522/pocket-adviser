import { cn } from "@/components/utils";

interface ContainerProps extends React.HTMLProps<HTMLDivElement>{};

export default function Container({ children, className, ...props }: ContainerProps) {

    return (
        <div className={cn('sm:container xl:max-w-[1600px]', className)}>
            {children}
        </div>
    )
}