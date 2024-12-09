
import matter from "gray-matter";
import fs from "fs";

import { join } from "path";

type FrontMatter = {
    title: string
    lesson: number
    group: number
    groupTitle: string
    difficulty: number
    importance: number
    prompts?: string[]
}

export type Lesson = {
    frontmatter: FrontMatter
    slug: string
    content: string
}

export type LessonGroup = {
    title: string
    number: number
    lessons: Lesson[]
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
        content,
    } satisfies Lesson;
}

export function getAllLessons() {
    const slugs = getLessonSlugs();
    const lessons = slugs
        .map((slug) => getLessonBySlug(slug));
    // sort by lesson number before returning
    return lessons.sort((a, b) => a.frontmatter.lesson - b.frontmatter.lesson);
}

export function getLessonsByGroup() {
    const lessons = getAllLessons();

    // group lessons by name
    const groups: { [key: string]: Lesson[] } = {};
    for (const lesson of lessons) {
        if (!lesson.frontmatter.groupTitle) continue;

        if (groups[lesson.frontmatter.groupTitle]) {
            groups[lesson.frontmatter.groupTitle].push(lesson);
        } else {
            groups[lesson.frontmatter.groupTitle] = [lesson];
        }
    }

    return Object.entries(groups).map(([title, lessons]) => ({
        title,
        lessons,
        number: lessons[0].frontmatter.group,
    })) satisfies LessonGroup[];
}