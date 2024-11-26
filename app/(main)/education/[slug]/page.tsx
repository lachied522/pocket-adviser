import { notFound } from "next/navigation";

import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { Separator } from "@/components/ui/separator";

import { getAllLessons, getLessonBySlug } from "./helpers";

import LessonNavigation from "./lesson-navigation";
import CustomInput from "./custom-input";

function H2(props: any) {
    return (
        <h2 className="text-xl font-semibold">
            {props.children}
        </h2>
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
        <ul className='list-disc pl-3'>
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
                    <LessonNavigation slug={slug} />
                    <h2 className='text-2xl font-medium'>{lesson.frontmatter.title}</h2>
                    <Separator className='my-6' />

                    <div className='text-wrap whitespace-pre-line'>
                        <Markdown
                            rehypePlugins={[rehypeRaw]}
                            components={{
                                h2: H2, a: A,
                                img: Img, input: CustomInput,
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