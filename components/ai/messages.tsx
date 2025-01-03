import Markdown from "react-markdown";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/utils";

/** formatting functions for markdown */
function H3(props: any) {
    return (
        <h3 className="font-semibold">
            {props.children}
        </h3>
    )
}

function OrderedList(props: any) {
    return (
        <ol className="whitespace-normal leading-loose list-decimal *:ml-3 *:sm:ml-6">
            {props.children}
        </ol>
    )
}

function UnorderedList(props: any) {
    return (
        <ul className="whitespace-normal leading-loose list-disc *:ml-3 *:sm:ml-6">
            {props.children}
        </ul>
    )
}

function Link(props: any) {
    return (
      <a
        href={props.href}
        target="_blank"
        rel="noreferrer"
        className="text-sky-600 underline"
    >
        {props.children}
      </a>
    );
}

function Strong(props: any) {
    return (
        <strong className="font-medium">
            {props.children}
        </strong>
    )
}

/** end formatting functions */

export function PlainTextMessage({
    content,
    role = "assistant"
}: {
    content: string,
    role?: "user"|"assistant"
}) {
    if (content.length === 0) return null;
    return (
        <Card className="rounded-xl overflow-hidden">
            <CardContent className={cn(
                "max-w-[900px] px-3 py-2 text-wrap text-sm sm:text-base whitespace-pre-line",
                role === "user" && "bg-neutral-50 border-none"
            )}>
                <Markdown components={{ h3: H3, ol: OrderedList, ul: UnorderedList, a: Link, strong: Strong }}>
                    {content}
                </Markdown>
            </CardContent>
        </Card>
    )
}
