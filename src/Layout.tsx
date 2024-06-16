import { Drumstick } from "lucide-react";
import { ReactNode } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <div className="flex flex-1 items-center justify-between space-x-2">
            <nav className="flex flex-row items-center gap-5 text-sm lg:gap-6">
              <a
                href="#"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
              >
                <Drumstick color="#f59e0b" size={24} />
                <span className="text-amber-500">json duck</span>
              </a>
              {/* <a
              href="#"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Test
            </a> */}
            </nav>
            <ModeToggle />
          </div>
        </header>
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}

export default Layout;
