import { generateId, type Message } from 'ai';

import { getGreeting } from "./greeting";

import { ChatProvider } from "./components/context";
import ChatArea from "./components/chat-area";

import WelcomeDialog from "@/components/dialogs/welcome-dialog";

export default async function MainPage({
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const initialUserMessage = typeof searchParams?.query === "string"? searchParams.query: undefined;

    const conversationHistory: Message[] = [];
    // if no user query, append default assistant greeting
    if (!initialUserMessage) {
        const greeting = await getGreeting();
        conversationHistory.push({ id: generateId(), role: "assistant", content: greeting });
    }

    return (
      <ChatProvider
        conversationHistory={conversationHistory}
        initialUserMessage={initialUserMessage}
        initialToolName={typeof searchParams?.toolName === "string"? searchParams.toolName: undefined}
      >
        <ChatArea />
        {searchParams?.welcome === "true" && <WelcomeDialog initialIsOpen={true} />}
      </ChatProvider>
    )
}