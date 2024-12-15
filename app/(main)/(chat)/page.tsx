import { generateId, type Message } from 'ai';

import { getAdviceById } from '@/utils/crud/advice';

import WelcomeDialog from "@/components/dialogs/welcome-dialog";

import { getGreeting } from "./greeting";

import { ChatProvider } from "./context";
import ChatArea from "./components/chat-area";

export default async function MainPage({
    searchParams
}: {
    searchParams?: { [key: string]: string | string[] | undefined }
}) {
    const initialUserMessage = typeof searchParams?.query === "string"? searchParams.query: undefined;
    const adviceId = typeof searchParams?.adviceId === "string"? Number(searchParams.adviceId): undefined;

    const conversationHistory: Message[] = [];
    // if no user query, append default assistant greeting
    if (!(initialUserMessage || adviceId)) {
        const greeting = await getGreeting();
        conversationHistory.push({ id: generateId(), role: "assistant", content: greeting });
    }

    if (adviceId) {
        const advice = await getAdviceById(adviceId);
        if (advice) {
            conversationHistory.push({
              id: generateId(),
              role: "assistant",
              content: '',
              toolInvocations: [{
                  toolCallId: generateId(),
                  state: 'result',
                  toolName: 'getRecommendations',
                  result: advice,
                  args: { amount: advice.amount }
              }]
            });
        }
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