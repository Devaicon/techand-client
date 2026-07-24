"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AdminAuthProvider, useAdminAuth } from "../AdminAuthProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";

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
    <div className="min-h-screen bg-[#F6F7FB] lg:flex">
      <AdminSidebar />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <AdminAuthProvider>
      <Guard>{children}</Guard>
    </AdminAuthProvider>
  );
}
