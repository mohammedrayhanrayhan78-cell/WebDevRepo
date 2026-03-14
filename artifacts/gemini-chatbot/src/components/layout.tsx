import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const style = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background overflow-hidden relative">
        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[10s]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[12s]" />
        </div>

        <AppSidebar />
        
        <div className="flex flex-col flex-1 relative z-10 w-full overflow-hidden">
          <header className="flex h-14 items-center justify-between px-4 border-b border-border/40 bg-background/50 backdrop-blur-md lg:hidden">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <div className="font-display font-semibold text-sm">Gemini AI</div>
            <div className="w-8" /> {/* Spacer for centering */}
          </header>
          
          <main className="flex-1 w-full h-full overflow-hidden relative">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
