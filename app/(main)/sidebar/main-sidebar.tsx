"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { ArrowUpDown, BriefcaseBusiness, GraduationCap, Home, MessageCirclePlus, NotebookPen, SearchCheck, UserRound } from "lucide-react";

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
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import ProfileDialog from "@/components/profile/profile-dialog";
import NotesDialog from "@/components/dialogs/notes-dialog";
import CheckupDialog from "@/components/dialogs/checkup-dialog";
import GetAdviceDialog from "@/components/dialogs/get-advice-dialog";
import PortfolioDialog from "@/components/portfolio/portfolio-dialog";
import DisclaimerDialog from "@/components/dialogs/disclaimer-dialog";

import Conversations from "./conversations";
import NewChatButton from "./new-chat-button";

import type { Lesson } from "../education/[slug]/helpers";

const LESSON_GROUPS = [
    "Introduction",
    "Understanding the Stock Market",
    "Human Emotions and Market Psychology"
]

interface AppSidebarProps {
    lessons: Pick<Lesson, 'frontmatter'|'slug'>[]
}

// see https://ui.shadcn.com/blocks - nested sidebars
export default function AppSidebar({ lessons }: AppSidebarProps) {
    const pathname = usePathname();
    return (
        <Sidebar collapsible="icon" className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row">
            <Sidebar collapsible="none" className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div className="flex aspect-square size-8 items-center justify-center relative">
                                <Image
                                    src="/pocket-adviser-icon-black.png"
                                    alt="Pocket Adviser"
                                    fill
                                />
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarSeparator />

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-1.5 md:px-0">
                            <SidebarMenu className="gap-2">
                                <SidebarMenuItem>
                                    <Link href='/'>
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: "Home",
                                                hidden: false,
                                            }}
                                            isActive={pathname === '/' || pathname.includes('/c/')}
                                            className="px-2.5 md:px-2 data-[active=true]:bg-sidebar-primary/90 data-[active=true]:text-white"
                                        >
                                            <Home size={20} />
                                            <span>Home</span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <Link href='/education/welcome'>
                                        <SidebarMenuButton
                                            tooltip={{
                                                children: "Education",
                                                hidden: false,
                                            }}
                                            isActive={pathname.includes('education')}
                                            className="px-2.5 md:px-2 data-[active=true]:bg-sidebar-primary/90 data-[active=true]:text-white"
                                        >
                                            <GraduationCap size={20} />
                                            <span>Education</span>
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <SidebarSeparator className="block md:hidden" />

            <Sidebar collapsible="none" className="flex-1 flex">
                <SidebarHeader className="hidden md:flex">
                    <SidebarTrigger />
                </SidebarHeader>
                {pathname.includes("education") ? (
                <SidebarContent>
                    {LESSON_GROUPS.map((group, index) => (
                    <SidebarGroup key={`lesson-group-${index}`}>
                        <SidebarGroupLabel className="text-primary">{group}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {lessons.filter((lesson) => lesson.frontmatter.group === index + 1)
                                .map((lesson) => (
                                <SidebarMenuItem key={`lesson-${lesson.slug}`}>
                                    <Link href={`/education/${lesson.slug}`}>
                                        <SidebarMenuButton
                                            isActive={pathname.includes(lesson.slug)}
                                            className="h-9 max-w-[200px]"
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
                ) : (
                <SidebarContent>
                                        <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <Link href='/'>
                                        <SidebarMenuButton
                                            // variant="outline"
                                            // className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                        >
                                            <MessageCirclePlus size={16} />
                                            New chat
                                        </SidebarMenuButton>
                                    </Link>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <CheckupDialog>
                                        <SidebarMenuButton
                                            // variant="outline"
                                            // className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                        >
                                            <SearchCheck size={16} />
                                            Portfolio review
                                        </SidebarMenuButton>
                                    </CheckupDialog>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <GetAdviceDialog>
                                        <SidebarMenuButton
                                            // variant="outline"
                                            // className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                        >
                                            <ArrowUpDown size={16} className='rotate-90' />
                                            Deposit/withdraw
                                        </SidebarMenuButton>
                                    </GetAdviceDialog>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator />

                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <ProfileDialog>
                                        <SidebarMenuButton
                                            // variant="outline"
                                            // className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                        >
                                            <UserRound size={16} />
                                            Profile
                                        </SidebarMenuButton>
                                    </ProfileDialog>
                                </SidebarMenuItem>

                                <SidebarMenuItem>
                                    <NotesDialog>
                                        <SidebarMenuButton
                                            // variant="outline"
                                            // className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                        >
                                            <NotebookPen size={16} />
                                            Notes ✨
                                        </SidebarMenuButton>
                                    </NotesDialog>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    
                    <SidebarSeparator />

                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <PortfolioDialog>
                                        <SidebarMenuButton
                                            // variant="outline"
                                            // className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
                                        >
                                            <BriefcaseBusiness size={16} />
                                            Portfolio
                                        </SidebarMenuButton>
                                    </PortfolioDialog>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarSeparator />

                    <Conversations />
                </SidebarContent>
                )}

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
        </Sidebar>
    )
}