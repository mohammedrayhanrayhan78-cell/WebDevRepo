import { forwardRef } from "react";
import { User, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import { motion } from "framer-motion";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessageProps {
  role: string;
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ role, content, createdAt, isStreaming }, ref) => {
    const isAi = role === "model" || role === "assistant";

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex w-full gap-4 p-4 md:p-6",
          isAi ? "justify-start" : "justify-end"
        )}
      >
        {isAi && (
          <div className="flex-shrink-0 mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        )}

        <div
          className={cn(
            "flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
            isAi ? "items-start" : "items-end"
          )}
        >
          <div
            className={cn(
              "relative px-5 py-4 text-sm md:text-base leading-relaxed glass-panel",
              isAi
                ? "bg-card border-border/50 text-card-foreground rounded-2xl rounded-tl-sm shadow-xl shadow-black/20"
                : "bg-gradient-to-br from-primary to-primary/80 border-primary-border/50 text-primary-foreground rounded-2xl rounded-tr-sm shadow-lg shadow-primary/20"
            )}
          >
            {isAi ? (
              <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content || "..."}
                </ReactMarkdown>
                {isStreaming && (
                  <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
                )}
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">{content}</div>
            )}
          </div>

          {createdAt && (
            <span className="text-xs text-muted-foreground font-medium px-1">
              {format(new Date(createdAt), "h:mm a")}
            </span>
          )}
        </div>

        {!isAi && (
          <div className="flex-shrink-0 mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-secondary border border-border/50 shadow-md">
            <User className="h-4 w-4 text-secondary-foreground" />
          </div>
        )}
      </motion.div>
    );
  }
);

ChatMessage.displayName = "ChatMessage";
