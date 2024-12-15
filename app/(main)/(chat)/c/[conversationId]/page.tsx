import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { COOKIE_NAME_FOR_USER_ID } from "@/constants/cookies";

import { getConversationById } from '@/utils/crud/conversation';

import { ChatProvider } from '../../context';
import ChatArea from "../../components/chat-area";

import type { Message } from 'ai';

export default async function ConversationPage({
    params,
    searchParams
}: {
    params: { conversationId: string },
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
      // check if userId is in cookies
    const cookieStore = cookies();
    const userId = cookieStore.get(COOKIE_NAME_FOR_USER_ID)?.value;

    const conversationId = params.conversationId;

    let conversationHistory: Message[] = [];
    if (conversationId) {
        const conversation = await getConversationById(conversationId);

        if (!conversation || conversation.userId !== userId) {
            redirect('/');
        }

        conversationHistory = conversation.messages as Message[];
    }

    let initialUserMessage: string | undefined = undefined;
    // want to avoid unnecessary API requests by making sure
    // initial message is not already in conversation 
    if (typeof searchParams?.query === "string") {
        if (!conversationHistory.find((message) => message.role === "user" && message.content === searchParams.query)) {
            initialUserMessage = searchParams.query;
        }
    }

    return (
      <ChatProvider
        initialConversationId={conversationId}
        conversationHistory={conversationHistory}
        initialUserMessage={initialUserMessage}
        initialToolName={typeof searchParams?.toolName === "string"? searchParams.toolName: undefined}
      >
        <ChatArea />
      </ChatProvider>
    )
}