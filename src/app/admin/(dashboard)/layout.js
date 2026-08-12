"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "../AdminAuthProvider";
import { BlogQueuesProvider } from "../BlogQueuesProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ContextMenuProvider } from "@/components/admin/ContextMenu";
import { ToastProvider } from "@/components/admin/Toast";

function Guard({ children }) {
  const { user, loading } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/admin/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F7FB]">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  return (
    // `lg:h-screen` (not just min-h) is what makes `main` a real bounded scroll
    // container, so the page editor's split view can fill the viewport and
    // scroll its block list and its live preview independently. Below lg the
    // layout stacks and scrolls as one document, which is what a narrow screen
    // wants anyway.
    <div className="min-h-screen bg-[#F6F7FB] lg:flex lg:h-screen">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AdminAuthProvider>
      {/* One provider for the whole panel: right-click menus are raised from
          list rows, from panel headers and from inside the preview iframe, and
          only one of them may ever be open at a time. */}
      {/* Toasts wrap the menu so a menu action can raise one, and both sit
          outside the guard so a message survives a re-render of the page
          underneath it. */}
      <ToastProvider>
        <ContextMenuProvider>
          {/* Inside the auth provider (it needs `can`) and outside the guard,
              so the sidebar's queue counts and the overview's queues read the
              same pair of fetches. */}
          <BlogQueuesProvider>
            <Guard>{children}</Guard>
          </BlogQueuesProvider>
        </ContextMenuProvider>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
