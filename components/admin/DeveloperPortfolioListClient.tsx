"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, Pencil, Trash2, ExternalLink, Globe } from "lucide-react";
import { DeveloperPortfolioModal } from "./DeveloperPortfolioModal";
import { ConfirmModal } from "./ConfirmModal";

interface DeveloperItem {
  id: string;
  name: string;
  url: string;
  role: string | null;
  sortOrder: number;
}

interface DeveloperPortfolioListClientProps {
  initialDevelopers: DeveloperItem[];
}

export function DeveloperPortfolioListClient({
  initialDevelopers,
}: DeveloperPortfolioListClientProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDeveloper, setEditingDeveloper] = useState<DeveloperItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeveloperItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/developer-portfolios/${deleteTarget.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete developer portfolio");
      }

      toast.success("Developer portfolio deleted successfully!");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete developer portfolio");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Developer Portfolios
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage developer and team portfolio links that appear on the public proposal showcase.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingDeveloper(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Developer Portfolio</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Developer Name</th>
                <th className="px-6 py-3.5">Role / Title</th>
                <th className="px-6 py-3.5">Portfolio URL</th>
                <th className="px-6 py-3.5 text-center">Order</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialDevelopers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400">
                    No developer portfolios added yet. Click &ldquo;Add Developer Portfolio&rdquo; to create one.
                  </td>
                </tr>
              ) : (
                initialDevelopers.map((dev) => (
                  <tr key={dev.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {dev.name}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700 font-medium">
                        {dev.role || "Developer"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={dev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-mono"
                      >
                        <span>{dev.url}</span>
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-center text-xs text-slate-500">
                      {dev.sortOrder}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingDeveloper(dev);
                            setModalOpen(true);
                          }}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          title="Edit Portfolio"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteTarget(dev);
                            setDeleteModalOpen(true);
                          }}
                          className="rounded p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete Portfolio"
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

      <DeveloperPortfolioModal
        isOpen={modalOpen}
        developer={editingDeveloper}
        onClose={() => setModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Developer Portfolio?"
        message={`Are you sure you want to delete ${deleteTarget?.name}'s portfolio link?`}
        isLoading={deleteLoading}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
