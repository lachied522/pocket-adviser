
import matter from "gray-matter";
import fs from "fs";

import { join } from "path";

type FrontMatter = {
    title: string
    lesson: number
    group: number
    groupTitle: string
}

export type Lesson = {
    frontmatter: FrontMatter
    slug: string
    content: string
}

const postsDirectory = join(process.cwd(), "lessons");

export function getLessonSlugs() {
    return fs.readdirSync(postsDirectory);
}

export function getLessonBySlug(slug: string) {
    const realSlug = slug.replace(/\.md$/, '');
    const fullPath = join(postsDirectory, `${realSlug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
  
    return {
        frontmatter: data as FrontMatter,
        slug: realSlug,
        content
    } satisfies Lesson;
}

export function getAllLessons() {
    const slugs = getLessonSlugs();
    const lessons = slugs
        .map((slug) => getLessonBySlug(slug));
    // sort by lesson number before returning
    return lessons.sort((a, b) => a.frontmatter.lesson - b.frontmatter.lesson);
}