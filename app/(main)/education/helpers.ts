import { allLessons, type Lesson } from "content-collections";

export type LessonGroup = {
    title: string
    number: number
    lessons: Lesson[]
}

export function getLessonBySlug(slug: string) {
    const realSlug = slug.replace(/\.md$/, '');
    return allLessons.find((lesson) => lesson._meta.path === realSlug);
}

export function getLessonsByGroup() {
    // group lessons by group name
    const groups: { [key: string]: Lesson[] } = {};
    for (const lesson of allLessons) {
        if (!(lesson.group && lesson.groupTitle)) continue;

        if (groups[lesson.groupTitle]) {
            groups[lesson.groupTitle].push(lesson);
        } else {
            groups[lesson.groupTitle] = [lesson];
        }
    }

    const lessonGroups = Object.entries(groups).map(([title, lessons]) => ({
        title,
        lessons: lessons.sort((a, b) => a.lesson! - b.lesson!),
        number: lessons[0].group!,
    })) satisfies LessonGroup[];

    return lessonGroups.sort((a, b) => a.number - b.number);
}