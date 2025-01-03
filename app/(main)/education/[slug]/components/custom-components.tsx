import type { MDXComponents } from "mdx/types";

import { Calculator, Lightbulb, Quote } from "lucide-react";

import ImageWithCaption from "./image-with-caption";
import AnnuityCalculator from "./annuity-calculator";
import CoinFlipper from "./coin-flipper";
import RiskExample from "./risk-example";
import ImputationCalculator from "./imputation-calculator";
import DebtFinancingExample from "./debt-financing-example";

function H1(props: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h1 className="text-2xl font-semibold">
            {props.children}
        </h1>
    )
}

function H2(props: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2 className="text-xl font-semibold">
            {props.children}
        </h2>
    )
}

function H3(props: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className="font-semibold">
            {props.children}
        </h3>
    )
}

function A(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
        <a href={props.href} target="_blank" className="text-sky-600 underline">
            {props.children}
        </a>
    )
}

function UnorderedList(props: React.HTMLAttributes<HTMLUListElement>) {
    return (
        <ul className='list-disc pl-6'>
            {props.children}
        </ul>
    )
}

function OrderedList(props: React.HTMLAttributes<HTMLOListElement>) {
    return (
        <ol className='list-decimal pl-6'>
            {props.children}
        </ol>
    )
}

function ListItem(props: React.HTMLAttributes<HTMLLIElement>) {
    return (
        <li>
            {props.children}
        </li>
    )
}

function Img(props: React.HTMLAttributes<HTMLImageElement>) {
    return (
        <img
            className="max-h-[960px] mx-auto"
            {...props}            
        />
    )
}

function Blockquote(props: React.HTMLAttributes<HTMLQuoteElement>) {
    return (
        <blockquote className='grid grid-cols-5 items-center justify-start p-3'>
            <div className='mr-auto -scale-x-100 opacity-50'>
                <Quote
                    size={32}
                    fill="#a1a1aa"
                    stroke="#a1a1aa"
                />
            </div>
            <div className='col-span-4'>
                {props.children}
            </div>
        </blockquote>
    )
}

function KeyConcept({
    type = "Key Concept",
    content
}: {
    type: "Key Concept" | "Formula",
    content: string
}) {
    return (
        <div className='flex flex-col gap-3 p-3 border border-zinc-400 rounded-md'>
            <div className='flex flex-row items-center gap-2'>
                {type === "Formula"? <Calculator />: <Lightbulb />}
                <span className='text-lg font-medium capitalize'>{type}</span>
            </div>
            <p className='text-center p-6'>{content}</p>
        </div>
    )
}

const customComponents: MDXComponents = {
    h1: H1, h2: H2, h3: H3,
    a: A, img: Img,
    ul: UnorderedList, ol: OrderedList, li: ListItem,
    blockquote: Blockquote,
    KeyConcept, ImageWithCaption,
    AnnuityCalculator, CoinFlipper, RiskExample, ImputationCalculator,
    DebtFinancingExample,
}

export default customComponents;