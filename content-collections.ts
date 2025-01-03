import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";

import remarkMath from "remark-math";

const lessons = defineCollection({
    name: "lessons",
    directory: "lessons",
    include: "**/*.mdx",
    schema: (z) => ({
        title: z.string(),
        lesson: z.number().optional(),
        groupTitle: z.string().optional(),
        group: z.number().optional(),
        difficulty: z.number().optional(),
        importance: z.number().optional(),
    }),
    transform: async (document, context) => {
        const mdx = await compileMDX(context, document, {
            remarkPlugins: [remarkMath]
        });
        return {
          ...document,
          mdx,
        }
    },
});
 
export default defineConfig({
    collections: [lessons],
});