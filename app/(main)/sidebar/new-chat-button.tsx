"use client";
import { MessageCirclePlus } from "lucide-react";

import { useChatNavigation } from "@/hooks/useChatNavigation";

import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export default function NewChatButton() {
    const { onNavigateConversation } = useChatNavigation();
    const { setOpenMobile } = useSidebar();
    return (
        <Button
            variant='ghost'
            onClick={() => {
                onNavigateConversation();
                setOpenMobile(false);
            }}
            className='w-full flex flex-row justify-start gap-2 font-medium py-3 border border-zinc-600'
        >
            <MessageCirclePlus size={16} />
            New chat
        </Button>
    )
}