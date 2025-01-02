import { defineDocumentType, makeSource } from "contentlayer/source-files";
import remarkMath from "remark-math";

export const MdxLesson = defineDocumentType(() => ({
    name: 'MDXLesson',
    filePathPattern: `**/*.mdx`,
    contentType: 'mdx',
    fields: {
        title: { type: 'string', required: true },
        lesson: { type: 'number', required: false },
        groupTitle: { type: 'string', required: false },
        group: { type: 'number', required: false },
        difficulty: { type: 'number', required: false },
        importance: { type: 'string', required: false },
    },
    computedFields: {
        url: { type: 'string', resolve: (lesson) => `/lessons/${lesson._raw.flattenedPath}` },
    },
}));

export default makeSource({
    contentDirPath: 'lessons',
    documentTypes: [MdxLesson],
    mdx: {
        remarkPlugins: [remarkMath],
    }
});