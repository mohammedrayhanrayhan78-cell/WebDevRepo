import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getGetGeminiConversationQueryKey, getListGeminiConversationsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export interface OptimisticMessage {
  id: number;
  conversationId: number;
  role: string;
  content: string;
  createdAt: string;
}

export function useChatStream(conversationId?: number) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<OptimisticMessage | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;

    // Set optimistic user message
    setOptimisticUserMessage({
      id: Date.now(), // temporary ID
      conversationId,
      role: "user",
      content,
      createdAt: new Date().toISOString()
    });

    setIsStreaming(true);
    setStreamedText("");

    // Setup abort controller for this stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch(`/api/gemini/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }
      
      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullContent = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (!dataStr.trim()) continue;
              
              try {
                const data = JSON.parse(dataStr);
                if (data.content) {
                  fullContent += data.content;
                  setStreamedText(fullContent);
                }
                if (data.done) {
                  done = true;
                }
              } catch (e) {
                console.error("Failed to parse SSE chunk", e, "Data string:", dataStr);
              }
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Stream error:", error);
        toast({
          title: "Error",
          description: "Failed to generate AI response. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setIsStreaming(false);
      setOptimisticUserMessage(null);
      
      // Invalidate both the conversation to get the new messages and the list to update times
      queryClient.invalidateQueries({
        queryKey: getGetGeminiConversationQueryKey(conversationId)
      });
      queryClient.invalidateQueries({
        queryKey: getListGeminiConversationsQueryKey()
      });
    }
  }, [conversationId, queryClient, toast]);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      setOptimisticUserMessage(null);
      if (conversationId) {
        queryClient.invalidateQueries({
          queryKey: getGetGeminiConversationQueryKey(conversationId)
        });
      }
    }
  }, [conversationId, queryClient]);

  return { 
    sendMessage, 
    stopStreaming,
    isStreaming, 
    streamedText, 
    optimisticUserMessage 
  };
}
