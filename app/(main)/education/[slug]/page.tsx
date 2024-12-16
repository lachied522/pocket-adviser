import { notFound } from "next/navigation";

import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { Star } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/components/utils";

import { getAllLessons, getLessonBySlug } from "../helpers";
import LessonNavigation from "./lesson-navigation";

function H1(props: any) {
    return (
        <h1 className="text-2xl font-semibold">
            {props.children}
        </h1>
    )
}

function H2(props: any) {
    return (
        <h2 className="text-xl font-semibold">
            {props.children}
        </h2>
    )
}

function H3(props: any) {
    return (
        <h3 className="font-semibold">
            {props.children}
        </h3>
    )
}

function A(props: any) {
    return (
        <a className="text-sky-600 underline">
            {props.children}
        </a>
    )
}

function Img(props: any) {
    return (
        <img
            className="mx-auto"
            {...props}            
        />
    )
}

function Blockquote(props: any) {
    return (
        <blockquote className='text-center border border-l-2 border-l-zinc-600 rounded-md p-3'>
            {props.children}
        </blockquote>
    )
}

function UnorderedList(props: any) {
    return (
        <ul className='list-disc pl-6'>
            {props.children}
        </ul>
    )
}

function ListItem(props: any) {
    return (
        <li>
            {props.children}
        </li>
    )
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className='flex flex-row items-center gap-1'>
            {Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={`star-rating-${i}`}
                size={12}
                className={cn('text-zinc-600', i < rating && 'fill-zinc-600')}
            />
            ))}
        </div>
    )
}

export default async function Page({
    params,
  }: {
    params: Promise<{ slug: string }>
  }) {
    const slug = (await params).slug;

    const lesson = getLessonBySlug(slug);

    if (!lesson) {
        return notFound();
    }
    
    return (
        <div className='flex-1 overflow-hidden'>
            <div className='h-full overflow-y-auto'>
                <div className='max-w-4xl mx-auto px-3 pb-6'>
                    <div className='flex flex-col-reverse sm:flex-row items-start justify-between gap-1 sm:pt-3'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <h2 className='text-2xl font-medium'>{lesson.frontmatter.title}</h2>
                            <div className='flex flex-row items-center gap-3'>
                                <div className='flex flex-row items-center gap-2'>
                                    <span className='text-sm'>Importance</span>
                                    <StarRating rating={lesson.frontmatter.importance} />
                                </div>
                                <div className='flex flex-row items-center gap-2'>
                                    <span className='text-sm'>Difficulty</span>
                                    <StarRating rating={lesson.frontmatter.difficulty} />
                                </div>
                            </div>
                        </div>

                        <LessonNavigation slug={slug} />
                    </div>
                    <Separator className='my-6' />

                    <div className='text-wrap whitespace-pre-line'>
                        <Markdown
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                h1: H1, h2: H2, h3: H3,
                                a: A, img: Img,
                                blockquote: Blockquote,
                                ul: UnorderedList, li: ListItem
                            }}
                        >
                            {lesson.content}
                        </Markdown>
                    </div>

                    <LessonNavigation slug={slug} />
                </div>
            </div>
        </div>
    )
}

// generate static routes at build time
// see https://github.com/vercel/next.js/tree/canary/examples/blog-starter
export async function generateStaticParams() {
    const lessons = getAllLessons();
   
    return lessons.map((lesson) => ({
      slug: lesson.slug,
    }));
}