import { notFound } from "next/navigation";

import { Star } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { cn } from "@/components/utils";

import { allLessons } from "content-collections";
import { MDXContent } from "@content-collections/mdx/react";

import LessonNavigation from "./lesson-navigation";
import customComponents from "./components/custom-components";

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

    const lesson = allLessons.find((lesson) => lesson._meta.path === slug);

    if (!lesson) {
        return notFound();
    }

    return (
        <div className='flex-1 overflow-hidden'>
            <div className='h-full overflow-y-auto'>
                <div className='max-w-4xl mx-auto px-3 pb-6'>
                    <div className='flex flex-col-reverse sm:flex-row items-start justify-between gap-1 sm:pt-3'>
                        <div className='flex-1 flex flex-col gap-1'>
                            <h2 className='text-2xl font-medium'>{lesson.title}</h2>
                            <div className='flex flex-row items-center gap-3'>
                                <div className='flex flex-row items-center gap-2'>
                                    <span className='text-sm'>Importance</span>
                                    <StarRating rating={Number(lesson.importance)} />
                                </div>
                                <div className='flex flex-row items-center gap-2'>
                                    <span className='text-sm'>Difficulty</span>
                                    <StarRating rating={Number(lesson.difficulty)} />
                                </div>
                            </div>
                        </div>

                        <LessonNavigation slug={slug} />
                    </div>
                    <Separator className='my-6' />

                    <div className='text-wrap whitespace-pre-line mb-6'>
                        <MDXContent
                            code={lesson.mdx}
                            components={customComponents}
                        />
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
    return allLessons.map((lesson) => ({
        slug: lesson._meta.path,
    }));
}