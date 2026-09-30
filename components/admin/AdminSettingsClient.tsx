"use client";

import { useState } from "react";
import { Lock, CheckCircle2, AlertCircle, Server, Database } from "lucide-react";

interface AdminSettingsClientProps {
  adminEmail: string;
  adminName: string;
}

export function AdminSettingsClient({ adminEmail, adminName }: AdminSettingsClientProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setMessage({ type: "success", text: "Password has been successfully updated!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Settings</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage your administrative credentials and view database connection information.
        </p>
      </div>

      {/* Account Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Admin Profile</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="block text-xs font-semibold uppercase text-slate-400">Name</span>
            <span className="font-medium text-slate-800">{adminName}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold uppercase text-slate-400">Email Address</span>
            <span className="font-medium text-slate-800">{adminEmail}</span>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-slate-600" />
          <h2 className="text-base font-bold text-slate-900">Change Password</h2>
        </div>

        {message && (
          <div
            className={`mb-4 flex items-center gap-2 rounded-lg p-3 text-xs ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Database Connection Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Database Connection</h2>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Connected to serverless Neon PostgreSQL with Prisma client pooling.
        </p>
        <div className="rounded-lg bg-slate-50 p-3 text-xs font-mono text-slate-600 border border-slate-200 break-all">
          Host: ep-long-mode-b3z0dr90-pooler.c-4.ap-southeast-1.aws.neon.tech
          <br />
          Database: neondb
          <br />
          SSL Mode: require
        </div>
      </div>
    </div>
  );
}
