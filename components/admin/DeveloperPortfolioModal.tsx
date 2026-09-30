"use client";

import { useState, useEffect } from "react";
import { X, Globe } from "lucide-react";
import { formatUrl } from "@/lib/utils";

interface DeveloperPortfolioItem {
  id: string;
  name: string;
  url: string;
  role: string | null;
  sortOrder: number;
}

interface DeveloperPortfolioModalProps {
  isOpen: boolean;
  developer?: DeveloperPortfolioItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeveloperPortfolioModal({
  isOpen,
  developer,
  onClose,
  onSuccess,
}: DeveloperPortfolioModalProps) {
  const isEditing = Boolean(developer?.id);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [role, setRole] = useState("Developer");
  const [sortOrder, setSortOrder] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (developer) {
      setName(developer.name);
      setUrl(developer.url);
      setRole(developer.role || "Developer");
      setSortOrder(developer.sortOrder || 0);
    } else {
      setName("");
      setUrl("");
      setRole("Developer");
      setSortOrder(0);
    }
    setError(null);
  }, [developer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name: name.trim(),
      url: formatUrl(url.trim()),
      role: role.trim() || "Developer",
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      const endpoint = isEditing
        ? `/api/developer-portfolios/${developer?.id}`
        : "/api/developer-portfolios";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save developer portfolio");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Developer Portfolio" : "Add Developer Portfolio"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Developer Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jeet, Krishan, Kahan Singh"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Portfolio Website URL *
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://jeetofficial.in/"
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Full-Stack Developer"
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Add Portfolio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
