import Link from "next/link";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import DisclaimerDialog from "@/components/dialogs/disclaimer-dialog";

import { getAllLessons, type Lesson } from "./helpers";
import { GraduationCap, MessageCirclePlus, Plus } from "lucide-react";

const GROUPS = [
    "Introduction",
    "Understanding the Stock Market",
    "Human Emotions and Market Psychology"
]

interface EducationSidebarProps {
    slug: string
}

export default function EducationSidebar({ slug }: EducationSidebarProps) {
    const lessons = getAllLessons();

    return (
        <Sidebar>
            <SidebarHeader className='px-3'>
                <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent className='px-3'>
                <Button
                    variant="ghost"
                    className="w-full flex flex-row font-medium py-3 border border-zinc-600"
                >
                    <MessageCirclePlus size={20} />
                    New Chat
                </Button>

                <SidebarSeparator />

                <Button>
                    <GraduationCap size={20} />
                    Education
                </Button>
                {GROUPS.map((group, index) => (
                <SidebarGroup>
                    <SidebarGroupLabel className="text-primary">{group}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {lessons.filter((lesson) => lesson.frontmatter.group === index + 1)
                            .map((lesson) => (
                            <SidebarMenuItem key={`lesson-${lesson.slug}`}>
                                <Link href={`/education/${lesson.slug}`}>
                                    <SidebarMenuButton
                                        isActive={lesson.slug === slug}
                                        className="h-9"
                                    >
                                        <span className="truncate">{lesson.frontmatter.title}</span>
                                    </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DisclaimerDialog>
                            <button className='w-full text-xs text-center underline mb-3'>
                                Disclaimer
                            </button>
                        </DisclaimerDialog>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}