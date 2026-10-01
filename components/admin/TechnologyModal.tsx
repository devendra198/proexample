"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import { slugify } from "@/lib/utils";

interface CategoryItem {
  id: string;
  name: string;
}

interface TechnologyModalProps {
  isOpen: boolean;
  categories: CategoryItem[];
  technology?: {
    id: string;
    name: string;
    slug: string;
    categoryId: string;
    description: string | null;
    status: string;
    sortOrder: number;
  } | null;
  defaultCategoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function TechnologyModal({
  isOpen,
  categories,
  technology,
  defaultCategoryId,
  onClose,
  onSuccess,
}: TechnologyModalProps) {
  const isEditing = Boolean(technology?.id);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [sortOrder, setSortOrder] = useState(0);
  const [autoSlug, setAutoSlug] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (technology) {
      setName(technology.name);
      setSlug(technology.slug);
      setCategoryId(technology.categoryId);
      setDescription(technology.description || "");
      setStatus(technology.status);
      setSortOrder(technology.sortOrder || 0);
      setAutoSlug(false);
    } else {
      setName("");
      setSlug("");
      setCategoryId(defaultCategoryId || (categories[0]?.id || ""));
      setDescription("");
      setStatus("ACTIVE");
      setSortOrder(0);
      setAutoSlug(true);
    }
    setError(null);
  }, [technology, isOpen, categories, defaultCategoryId]);

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
      categoryId,
      description: description.trim() || null,
      status,
      sortOrder: Number(sortOrder),
    };

    try {
      const url = isEditing ? `/api/technologies/${technology?.id}` : "/api/technologies";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save technology");
      }

      toast.success(isEditing ? "Technology updated successfully!" : "Technology created successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || "Failed to save technology");
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
            {isEditing ? "Edit Technology" : "Add New Technology"}
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
              Parent Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="" disabled>Select parent category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Technology Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. React Native, Laravel, WordPress"
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
              placeholder="react-native"
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
              placeholder="Framework details, versions, or focus..."
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
              {loading ? "Saving..." : isEditing ? "Save Changes" : "Create Technology"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
