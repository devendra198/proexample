"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Cpu,
  FolderGit2,
  ExternalLink,
  Settings,
  LogOut,
  X,
  Globe,
} from "lucide-react";
import { useState } from "react";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Technologies", href: "/admin/technologies", icon: Cpu },
    { name: "Projects", href: "/admin/projects", icon: FolderGit2 },
    { name: "Dev Portfolios", href: "/admin/developers", icon: Globe },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setLoggingOut(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-64 flex-col justify-between bg-[#0F172A] text-slate-300">
      <div>
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <div>
            <Link href="/admin" className="text-lg font-bold text-white tracking-tight">
              Pro-Example
            </Link>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Admin Panel
            </span>
          </div>
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5 p-4">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors ${active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                  }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-2">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-800/80 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink className="h-4 w-4 text-slate-400" />
                <span>View Website</span>
              </div>
            </Link>
          </div>
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:bg-rose-950/40 hover:text-rose-400 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>{loggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}
