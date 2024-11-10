"use client";
import { useSidebar, SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/components/utils";

export default function SidebarOuterTrigger() {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

    return (
        <div className={cn("hidden pl-3", (isMobile || state === "collapsed") && "block")}>
            <SidebarTrigger />
        </div>
    )
}