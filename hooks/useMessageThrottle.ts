import { useState, useEffect } from "react";
import throttle from "lodash.throttle";

import type { Message } from "ai";

export function useMessageThrottle(messages: Message[], delay = 50) {
    const [throttledMessages, setThrottledMessages] = useState<Message[]>(messages);  

    useEffect(() => {
      // see https://github.com/vercel/ai/issues/1963#issuecomment-2299525599
      const updateThrottledMessages = throttle(
          (_messages: Message[]) => {
              setThrottledMessages(_messages);
          },
          delay
      );

      updateThrottledMessages(messages);

      return () => updateThrottledMessages.cancel();
    }, [messages[messages.length - 1]]);

    return throttledMessages;
}