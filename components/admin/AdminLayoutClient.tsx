"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Menu, ExternalLink, Shield } from "lucide-react";
import Link from "next/link";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  adminName?: string;
  adminEmail?: string;
}

export function AdminLayoutClient({
  children,
  adminName = "Admin",
  adminEmail = "admin@Pro-Example.com",
}: AdminLayoutClientProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-800">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile drawer backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <AdminSidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden font-bold text-slate-900">
              Pro-Example Admin
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>View Website</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-semibold text-slate-800">{adminName}</div>
                <div className="text-slate-400 truncate max-w-[150px]">{adminEmail}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
