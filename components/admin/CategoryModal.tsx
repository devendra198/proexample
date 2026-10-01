"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { slugify } from "@/lib/utils";

interface CategoryModalProps {
  isOpen: boolean;
  category?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
    sortOrder: number;
  } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
}: CategoryModalProps) {
  const isEditing = Boolean(category?.id);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [sortOrder, setSortOrder] = useState(0);
  const [autoSlug, setAutoSlug] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
      setStatus(category.status);
      setSortOrder(category.sortOrder || 0);
      setAutoSlug(false);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setStatus("ACTIVE");
      setSortOrder(0);
      setAutoSlug(true);
    }
    setError(null);
  }, [category, isOpen]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      name,
      slug,
      description: description.trim() || null,
      status,
      sortOrder: Number(sortOrder),
    };

    try {
      const url = isEditing ? `/api/categories/${category?.id}` : "/api/categories";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save category");
      }

      toast.success(isEditing ? "Category updated successfully!" : "Category created successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Category" : "Add New Category"}
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
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Web Development"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Slug *
              </label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="text-[11px] text-blue-600 hover:underline"
              >
                {autoSlug ? "Manual Slug" : "Auto Slug"}
              </button>
            </div>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setAutoSlug(false);
                setSlug(slugify(e.target.value));
              }}
              placeholder="web-development"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-mono text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this technical field..."
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
