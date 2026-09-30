"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, Search, Filter } from "lucide-react";
import { TechnologyModal } from "./TechnologyModal";
import { ConfirmModal } from "./ConfirmModal";

interface CategoryItem {
  id: string;
  name: string;
}

interface TechnologyItem {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  description: string | null;
  status: string;
  sortOrder: number;
  category: {
    id: string;
    name: string;
  };
  _count: {
    projects: number;
  };
}

interface TechnologyListClientProps {
  initialTechnologies: TechnologyItem[];
  categories: CategoryItem[];
}

export function TechnologyListClient({
  initialTechnologies,
  categories,
}: TechnologyListClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<TechnologyItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TechnologyItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>(undefined);

  const filteredTechnologies = useMemo(() => {
    return initialTechnologies.filter((tech) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!tech.name.toLowerCase().includes(q) && !tech.category.name.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (selectedCategory !== "all" && tech.categoryId !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [initialTechnologies, search, selectedCategory]);

  const handleToggleStatus = async (tech: TechnologyItem) => {
    const nextStatus = tech.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await fetch(`/api/technologies/${tech.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: tech.name,
          slug: tech.slug,
          categoryId: tech.categoryId,
          description: tech.description,
          status: nextStatus,
          sortOrder: tech.sortOrder,
        }),
      });
      router.refresh();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (force: boolean = false) => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/technologies/${deleteTarget.id}${force ? "?force=true" : ""}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.hasDependencies && !force) {
          setDeleteWarning(data.error);
          setDeleteLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to delete");
      }

      setDeleteModalOpen(false);
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Technology Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Define platforms, frameworks, and programming languages grouped by category.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTech(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Technology</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search technologies..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Technology Name</th>
                <th className="px-6 py-3.5">Parent Category</th>
                <th className="px-6 py-3.5">Slug</th>
                <th className="px-6 py-3.5 text-center">Projects</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTechnologies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No technologies found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredTechnologies.map((tech) => (
                  <tr key={tech.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {tech.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {tech.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{tech.slug}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {tech._count.projects}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(tech)}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                          tech.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Click to toggle status"
                      >
                        {tech.status === "ACTIVE" ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTech(tech);
                            setModalOpen(true);
                          }}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          title="Edit Technology"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(tech);
                            setDeleteWarning(undefined);
                            setDeleteModalOpen(true);
                          }}
                          className="rounded p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Technology"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TechnologyModal
        isOpen={modalOpen}
        categories={categories}
        technology={editingTech}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Technology?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
        warningNotice={deleteWarning}
        isLoading={deleteLoading}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => handleDelete(Boolean(deleteWarning))}
      />
    </div>
  );
}
