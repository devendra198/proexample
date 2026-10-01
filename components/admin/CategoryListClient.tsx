"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle, ArrowUpDown } from "lucide-react";
import { CategoryModal } from "./CategoryModal";
import { ConfirmModal } from "./ConfirmModal";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  sortOrder: number;
  _count: {
    technologies: number;
    projects: number;
  };
}

export function CategoryListClient({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>(undefined);

  const handleToggleStatus = async (cat: CategoryItem) => {
    const nextStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await fetch(`/api/categories/${cat.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          status: nextStatus,
          sortOrder: cat.sortOrder,
        }),
      });
      toast.success(`Category set to ${nextStatus.toLowerCase()}`);
      router.refresh();
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (force: boolean = false) => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}${force ? "?force=true" : ""}`, {
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

      toast.success("Category deleted successfully!");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Category Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Create, organize, and manage technical portfolio categories.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCategory(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Category Name</th>
                <th className="px-6 py-3.5">Slug</th>
                <th className="px-6 py-3.5 text-center">Technologies</th>
                <th className="px-6 py-3.5 text-center">Projects</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Order</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                    No categories found. Click &ldquo;Add Category&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                initialCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{cat.name}</div>
                      {cat.description && (
                        <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                          {cat.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{cat.slug}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {cat._count.technologies}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {cat._count.projects}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                          cat.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                        title="Click to toggle status"
                      >
                        {cat.status === "ACTIVE" ? (
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
                    <td className="px-6 py-4 text-center text-xs text-slate-500">
                      {cat.sortOrder}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setModalOpen(true);
                          }}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          title="Edit Category"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(cat);
                            setDeleteWarning(undefined);
                            setDeleteModalOpen(true);
                          }}
                          className="rounded p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Category"
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

      <CategoryModal
        isOpen={modalOpen}
        category={editingCategory}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Category?"
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
