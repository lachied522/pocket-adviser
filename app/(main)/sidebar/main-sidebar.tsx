"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { ArrowUpDown, BriefcaseBusiness, GraduationCap, Home, MessageCirclePlus, NotebookPen, SearchCheck, UserRound, ChevronRight, CheckCheck } from "lucide-react";

import { type GlobalState, useGlobalContext } from "@/context/GlobalContext";

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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import ProfileDialog from "@/components/profile/profile-dialog";
import NotesDialog from "@/components/dialogs/notes-dialog";
import CheckupDialog from "@/components/dialogs/checkup-dialog";
import GetAdviceDialog from "@/components/dialogs/get-advice-dialog";
import PortfolioDialog from "@/components/portfolio/portfolio-dialog";
import DisclaimerDialog from "@/components/dialogs/disclaimer-dialog";

import Conversations from "./conversations";

import type { LessonGroup } from "../education/helpers";

interface AppSidebarProps {
    lessonGroups: LessonGroup[]
}

// see https://ui.shadcn.com/blocks - nested sidebars
export default function AppSidebar({ lessonGroups }: AppSidebarProps) {
    const { state } = useGlobalContext() as GlobalState;
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
                                    <Link href={`/education/${Object.entries(state.lessons ?? {}).find(([_, value]) => value === "in-progress")?.[0] ?? 'welcome'}`}>
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
                    {lessonGroups.map((group, index) => (
                    <Collapsible
                        key={`lesson-group-${index}`}
                        title={group.title}
                        defaultOpen={!!group.lessons.find((lesson) => lesson.frontmatter.group === index + 1 && pathname.includes(lesson.slug))}
                        className="group/collapsible"
                    >
                        <SidebarGroup>
                            <SidebarGroupLabel className="text-primary">
                                <CollapsibleTrigger className="w-full flex flex-row items-center justify-between gap-1">
                                    <span className="text-left">{group.title}</span>
                                    <ChevronRight
                                        size={16}
                                        className="shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90"
                                    />
                                </CollapsibleTrigger>
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                                <SidebarGroupContent className="pt-1">
                                    <SidebarMenu>
                                        {group.lessons
                                        .filter((lesson) => lesson.frontmatter.group === index + 1)
                                        .map((lesson) => (
                                        <SidebarMenuItem key={`lesson-${lesson.slug}`}>
                                            <Link href={`/education/${lesson.slug}`}>
                                                <SidebarMenuButton
                                                    isActive={pathname === `/education/${lesson.slug}`}
                                                    className="h-9 max-w-[200px] flex flex-row items-center justify-start gap-1 px-1"
                                                >
                                                    <div className='size-4 flex items-center justify-center'>
                                                        {(state.lessons as any)?.[lesson.slug] === "completed" && (
                                                        <CheckCheck size={12} className='text-green-400' />
                                                        )}
                                                    </div>
                                                    <span className="text-xs truncate">{lesson.frontmatter.title}</span>
                                                </SidebarMenuButton>
                                            </Link>
                                        </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </CollapsibleContent>
                        </SidebarGroup>
                    </Collapsible>
                    ))}
                </SidebarContent>
                ) : (
                <SidebarContent className='overflow-hidden'>
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