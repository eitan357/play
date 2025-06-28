import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Theater, Upload, BookOpen, Mic, BarChart3, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Home",
    url: createPageUrl("Home"),
    icon: Home,
  },
  {
    title: "Upload Script",
    url: createPageUrl("Upload"),
    icon: Upload,
  },
  {
    title: "My Scripts",
    url: createPageUrl("Scripts"),
    icon: BookOpen,
  },
  {
    title: "Performance",
    url: createPageUrl("Performance"),
    icon: BarChart3,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --theater-burgundy: #722F37;
          --theater-gold: #D4AF37;
          --theater-cream: #FDF6E3;
          --theater-charcoal: #2C2C2C;
          --theater-silver: #C0C0C0;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, var(--theater-cream) 0%, #F8F4E6 100%);
        }
        
        .theater-gradient {
          background: linear-gradient(135deg, var(--theater-burgundy) 0%, #8B3A42 100%);
        }
        
        .gold-accent {
          background: linear-gradient(135deg, var(--theater-gold) 0%, #E6C547 100%);
        }
        
        .curtain-shadow {
          box-shadow: 0 8px 32px rgba(114, 47, 55, 0.15);
        }
      `}</style>

      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-gray-200/50 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-gray-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 theater-gradient rounded-xl flex items-center justify-center curtain-shadow">
                <Theater className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900">LineCoach</h2>
                <p className="text-xs text-gray-500 font-medium">
                  Professional Rehearsal Studio
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-3">
                Studio
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-gradient-to-r hover:from-red-50 hover:to-amber-50 hover:text-red-700 transition-all duration-300 rounded-xl py-3 ${
                          location.pathname === item.url
                            ? "bg-gradient-to-r from-red-50 to-amber-50 text-red-700 shadow-sm"
                            : ""
                        }`}
                      >
                        <Link
                          to={item.url}
                          className="flex items-center gap-3 px-4"
                        >
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-gray-100/80 p-2 rounded-xl transition-colors duration-200" />
              <div className="flex items-center gap-2">
                <Theater className="w-6 h-6 text-red-700" />
                <h1 className="text-xl font-bold text-gray-900">LineCoach</h1>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
