import { useEffect, useRef, useState } from "react";
import { useParams } from "wouter";
import { Send, SquareSquare, ArrowDown, Bot } from "lucide-react";
import { useGetGeminiConversation } from "@workspace/api-client-react";
import { useChatStream } from "@/hooks/use-chat-stream";
import { ChatMessage } from "@/components/chat-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPage() {
  const { id } = useParams();
  const conversationId = id ? parseInt(id, 10) : undefined;
  const [input, setInput] = useState("");
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { data: conversation, isLoading, isError } = useGetGeminiConversation(
    conversationId as number,
    { query: { enabled: !!conversationId } }
  );

  const { 
    sendMessage, 
    stopStreaming,
    isStreaming, 
    streamedText, 
    optimisticUserMessage 
  } = useChatStream(conversationId);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom on new messages or streaming updates
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, streamedText, optimisticUserMessage]);

  // Focus textarea on load
  useEffect(() => {
    textareaRef.current?.focus();
  }, [conversationId]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col p-6 space-y-6">
        <Skeleton className="h-24 w-3/4 self-start rounded-2xl bg-secondary/50" />
        <Skeleton className="h-16 w-1/2 self-end rounded-2xl bg-primary/20" />
        <Skeleton className="h-32 w-2/3 self-start rounded-2xl bg-secondary/50" />
      </div>
    );
  }

  if (isError || !conversation) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center space-y-4 max-w-sm glass-panel p-8 rounded-3xl">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h2 className="text-xl font-display font-semibold">Conversation not found</h2>
          <p className="text-muted-foreground text-sm">
            This conversation might have been deleted or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const messages = conversation.messages || [];
  const hasMessages = messages.length > 0 || optimisticUserMessage;

  return (
    <div className="flex h-full w-full flex-col relative">
      <div className="flex-1 overflow-y-auto px-2 md:px-6 pt-6 pb-36 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col gap-2">
          {!hasMessages && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <div className="h-20 w-20 relative bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 rotate-3 border border-white/10">
                  <Bot className="h-10 w-10 text-white -rotate-3" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-display font-bold">How can I help you today?</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  I'm Gemini, a highly capable AI. Ask me to write code, explain concepts, or help with any task.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-2xl mt-8">
                {["Write a React component", "Explain quantum computing", "Help me debug an error"].map((suggestion) => (
                  <Button 
                    key={suggestion}
                    variant="outline" 
                    className="rounded-full bg-secondary/30 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                    onClick={() => {
                      setInput(suggestion);
                      textareaRef.current?.focus();
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatMessage 
                key={msg.id} 
                role={msg.role} 
                content={msg.content} 
                createdAt={msg.createdAt}
              />
            ))}
            
            {optimisticUserMessage && (
              <ChatMessage 
                key="optimistic" 
                role={optimisticUserMessage.role} 
                content={optimisticUserMessage.content} 
                createdAt={optimisticUserMessage.createdAt}
              />
            )}
            
            {isStreaming && (
              <ChatMessage 
                key="streaming" 
                role="model" 
                content={streamedText} 
                isStreaming={true}
              />
            )}
          </AnimatePresence>
          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent pt-10 pb-6 px-4 md:px-8">
        <div className="max-w-4xl mx-auto relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-accent/30 rounded-3xl blur opacity-30 group-focus-within:opacity-100 transition duration-500" />
          
          <div className="relative flex items-end gap-2 bg-card/80 backdrop-blur-xl border border-border/60 rounded-3xl p-2 shadow-2xl">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="Message Gemini..."
              className="min-h-[52px] max-h-[200px] w-full resize-none border-0 bg-transparent px-4 py-3.5 text-base focus-visible:ring-0 shadow-none scrollbar-thin"
              rows={1}
            />
            
            <div className="flex items-center gap-2 pb-1.5 pr-1.5">
              {isStreaming ? (
                <Button 
                  size="icon" 
                  variant="destructive" 
                  onClick={stopStreaming}
                  className="rounded-2xl h-10 w-10 shadow-lg"
                >
                  <SquareSquare className="h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  size="icon" 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="rounded-2xl h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50 transition-all duration-300"
                >
                  <Send className="h-4 w-4 translate-x-0.5" />
                </Button>
              )}
            </div>
          </div>
          <div className="text-center mt-3 text-xs text-muted-foreground/60 flex items-center justify-center gap-1">
            Gemini can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
