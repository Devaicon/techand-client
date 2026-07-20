"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, LogOut } from "lucide-react";
import { useAdminAuth } from "@/app/admin/AdminAuthProvider";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, perm: null },
  { href: "/admin/users", label: "Users", icon: Users, perm: "users:read" },
  { href: "/admin/team", label: "Team", icon: UserPlus, perm: "team:manage" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, can, logout } = useAdminAuth();

  return (
    <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
      <div className="px-6 py-6 text-xl font-bold text-[#37469E]">Tech& Admin</div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.filter((i) => !i.perm || can(i.perm)).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#37469E] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 px-2">
          <p className="truncate text-sm font-semibold text-gray-900">{user?.username}</p>
          <p className="truncate text-xs text-gray-500">{user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <LogOut size={16} />Sign out
        </button>
      </div>
    </aside>
  );
}
