import { notFound } from "next/navigation";

import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import { ArrowBigUp, MessageSquareQuote } from "lucide-react";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import TickerTape from "@/components/tape/ticker-tape";
import SettingsMenu from "@/components/settings/settings-menu";

import { getAllLessons, getLessonBySlug } from "./helpers";

import EducationSidebar from "./education-sidebar";
import SidebarOuterTrigger from "./sidebar-outer-trigger";
import LessonNavigation from "./lesson-header";
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
        <SidebarProvider>
            <EducationSidebar slug={slug} />
            <main className='h-dvh w-full overflow-y-scroll relative'>
                <div className='sticky top-0 bg-white'>
                    <div className='flex flex-row items-center overflow-hidden'>
                        <SidebarOuterTrigger />
                        <TickerTape />
                        <SettingsMenu userId={"test"} accountType="GUEST" />
                    </div>

                    <div className='max-w-4xl mx-auto'>
                        <LessonNavigation slug={slug} />
                    </div>
                </div>

                <div className='max-w-4xl text-wrap whitespace-pre-line mx-auto px-3 pb-6'>
                    <h2 className='text-2xl font-medium'>{lesson.frontmatter.title}</h2>
                    <Separator className='my-6' />
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
            </main>
        </SidebarProvider>
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