import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateGeminiConversation } from "@workspace/api-client-react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  const createMutation = useCreateGeminiConversation();

  const handleStart = () => {
    createMutation.mutate(
      { data: { title: "New Conversation" } },
      {
        onSuccess: (newConv) => {
          setLocation(`/c/${newConv.id}`);
        },
      }
    );
  };

  return (
    <div className="flex h-full w-full items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-2xl w-full px-6 flex flex-col items-center text-center space-y-10 relative z-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent blur-2xl opacity-40 group-hover:opacity-60 transition duration-700 rounded-full" />
          <div className="h-32 w-32 relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500">
            <Bot className="h-16 w-16 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-white/90 to-white/40">
            Gemini AI <span className="text-primary block sm:inline">Experience</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-medium">
            Engage in seamless, intelligent conversations powered by Google's most capable AI model.
          </p>
        </div>

        <Button 
          onClick={handleStart} 
          disabled={createMutation.isPending}
          size="lg"
          className="rounded-full px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
        >
          <Sparkles className="mr-2 h-5 w-5" />
          {createMutation.isPending ? "Initializing..." : "Start Chatting Now"}
        </Button>
      </div>
    </div>
  );
}
