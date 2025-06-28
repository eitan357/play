import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Theater, Upload, BookOpen, BarChart3, Home } from "lucide-react";
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
  useSidebar,
} from "./ui/sidebar";

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
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-gray-200/50 bg-white">
          <SidebarHeader className="border-b border-gray-200/50 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-700 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
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
                      <Link
                        to={item.url}
                        className={`block w-full hover:bg-gradient-to-r hover:from-red-50 hover:to-amber-50 hover:text-red-700 transition-all duration-300 rounded-xl py-3 ${
                          location.pathname === item.url
                            ? "bg-gradient-to-r from-red-50 to-amber-50 text-red-700 shadow-sm"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 px-4">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </div>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <MobileOverlay />

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

// Mobile overlay component
function MobileOverlay() {
  const { isOpen, setIsOpen } = useSidebar();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/20 z-40 lg:hidden"
      onClick={() => setIsOpen(false)}
    />
  );
}
