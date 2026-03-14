import { useLocation, Link } from "wouter";
import { MessageSquare, Plus, Trash2, Bot, LayoutGrid } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useListGeminiConversations, useCreateGeminiConversation, useDeleteGeminiConversation } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  
  const { data: conversations, isLoading } = useListGeminiConversations();
  const createMutation = useCreateGeminiConversation();
  const deleteMutation = useDeleteGeminiConversation();

  const handleNewChat = () => {
    createMutation.mutate(
      { data: { title: "New Conversation" } },
      {
        onSuccess: (newConv) => {
          setLocation(`/c/${newConv.id}`);
        },
      }
    );
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        if (location === `/c/${id}`) {
          setLocation("/");
        }
      }
    });
  };

  return (
    <Sidebar className="border-r border-border/50 bg-background/95 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 px-2 py-1 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Jarvis
          </span>
        </div>
        
        <Button 
          onClick={handleNewChat} 
          disabled={createMutation.isPending}
          className="w-full justify-start gap-2 bg-gradient-to-r from-primary/10 to-transparent hover:from-primary/20 border border-primary/20 hover:border-primary/40 text-foreground transition-all duration-300 rounded-xl"
          variant="outline"
        >
          <Plus className="h-4 w-4 text-primary" />
          New Chat
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground/70 font-medium tracking-wider text-xs uppercase px-4">
            Recent Conversations
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <div className="flex items-center gap-3 px-4 py-2 w-full">
                      <Skeleton className="h-4 w-4 rounded bg-muted/50" />
                      <Skeleton className="h-4 w-[120px] rounded bg-muted/50" />
                    </div>
                  </SidebarMenuItem>
                ))
              ) : conversations?.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <MessageSquare className="h-8 w-8 text-muted-foreground/30" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations?.map((conv) => {
                  const isActive = location === `/c/${conv.id}`;
                  return (
                    <SidebarMenuItem key={conv.id}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group flex items-center justify-between rounded-xl mx-2 px-3 py-6 transition-all duration-200 ${
                          isActive 
                            ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                            : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground border border-transparent"
                        }`}
                      >
                        <Link href={`/c/${conv.id}`} className="flex items-center gap-3 flex-1 overflow-hidden">
                          <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/70'}`} />
                          <div className="flex flex-col overflow-hidden">
                            <span className="truncate text-sm font-medium">{conv.title}</span>
                            <span className="text-[10px] text-muted-foreground/60">
                              {formatDistanceToNow(new Date(conv.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDelete(e, conv.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto h-7 w-7 hover:bg-destructive/10 hover:text-destructive shrink-0"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-2 py-2 text-xs text-muted-foreground">
          <LayoutGrid className="h-4 w-4" />
          <span>Powered by Gemini API</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
