import { generateId, type Message } from 'ai';

import { getConversationById } from '@/utils/crud/conversation';

import { ChatProvider } from '@/components/chat/context';
import ChatArea from "@/components/chat/chat-area";

export default async function MainPage({
    params,
    searchParams
}: {
    params: { conversationId: string },
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const conversationId = params.conversationId;

    let conversationHistory: Message[] = [];
    if (conversationId) {
        const conversation = await getConversationById(conversationId);

        if (conversation) {
          // TO DO: type this properly
          conversationHistory = conversation.messages as any;
        }
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
      >
        <ChatArea />
      </ChatProvider>
    )
}