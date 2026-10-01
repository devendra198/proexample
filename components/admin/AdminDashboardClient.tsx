"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Folder,
  FileCode,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { CategoryModal } from "./CategoryModal";
import { ConfirmModal } from "./ConfirmModal";
import { slugify } from "@/lib/utils";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  sortOrder: number;
  _count: {
    projects: number;
    technologies: number;
  };
}

interface TechnologyData {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface ProjectData {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  projectUrl: string;
  status: string;
  featured: boolean;
  category: {
    name: string;
    slug: string;
  };
  technology: {
    name: string;
    slug: string;
  };
}

interface StatsData {
  totalCategories: number;
  totalTechnologies: number;
  totalProjects: number;
  activeProjects: number;
  inactiveProjects: number;
  featuredProjects: number;
}

interface AdminDashboardClientProps {
  stats: StatsData;
  categories: CategoryData[];
  technologies: TechnologyData[];
  recentProjects: ProjectData[];
}

export function AdminDashboardClient({
  stats,
  categories,
  technologies,
  recentProjects,
}: AdminDashboardClientProps) {
  const router = useRouter();

  // Category Modal state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: "category" | "project";
    id: string;
    name: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState<string | undefined>(undefined);

  // Quick Add Project form state (matching the screenshot)
  const [quickCategory, setQuickCategory] = useState(categories[0]?.id || "");
  const [quickTitle, setQuickTitle] = useState("");
  const [quickTechnology, setQuickTechnology] = useState("");
  const [quickDescription, setQuickDescription] = useState("");
  const [quickProjectUrl, setQuickProjectUrl] = useState("");
  const [quickGithubUrl, setQuickGithubUrl] = useState("");
  const [quickImageUrl, setQuickImageUrl] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);

  // Filter available technologies for quick add
  const availableTechForQuick = technologies.filter((t) => t.categoryId === quickCategory);

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryData) => {
    setEditingCategory(cat);
    setCatModalOpen(true);
  };

  const handleDeletePrompt = (type: "category" | "project", id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteWarning(undefined);
    setDeleteModalOpen(true);
  };

  const executeDelete = async (force: boolean = false) => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const endpoint =
        deleteTarget.type === "category"
          ? `/api/categories/${deleteTarget.id}${force ? "?force=true" : ""}`
          : `/api/projects/${deleteTarget.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        if (data.hasDependencies && !force) {
          setDeleteWarning(data.error + " Click confirm to force delete along with sub-items.");
          setDeleteLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to delete item");
      }

      toast.success("Item deleted successfully!");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleQuickAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError(null);
    setQuickLoading(true);

    if (!quickCategory) {
      setQuickError("Please select a category");
      setQuickLoading(false);
      return;
    }

    const techId = quickTechnology || availableTechForQuick[0]?.id;
    if (!techId) {
      setQuickError("Please select or add a technology for this category first");
      setQuickLoading(false);
      return;
    }

    try {
      const payload = {
        name: quickTitle,
        slug: slugify(quickTitle) + "-" + Math.random().toString(36).substring(2, 6),
        categoryId: quickCategory,
        technologyId: techId,
        shortDescription: quickDescription.trim() || quickTitle.trim(),
        description: quickDescription.trim() || quickTitle.trim(),
        projectUrl: quickProjectUrl.startsWith("http") ? quickProjectUrl : `https://${quickProjectUrl}`,
        githubUrl: quickGithubUrl ? (quickGithubUrl.startsWith("http") ? quickGithubUrl : `https://${quickGithubUrl}`) : null,
        imageUrl: quickImageUrl || null,
        featured: false,
        status: "ACTIVE",
        sortOrder: 0,
        links: [],
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add project");
      }

      toast.success("Project added successfully!");
      // Reset form
      setQuickTitle("");
      setQuickDescription("");
      setQuickProjectUrl("");
      setQuickGithubUrl("");
      setQuickImageUrl("");
      router.refresh();
    } catch (err: any) {
      setQuickError(err.message);
      toast.error(err.message || "Failed to add project");
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">Manage your categories and projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New Project</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span>View Website</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Add New Project Section (Placed on top of the dashboard section) */}
      <div className="rounded-2xl border border-blue-200/80 bg-white p-6 shadow-sm ring-1 ring-blue-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Add New Project</h2>
              <p className="text-xs text-slate-500">Quickly add project title & URL to publish immediately</p>
            </div>
          </div>
          <Link
            href="/admin/projects/new"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Open Full Form &rarr;
          </Link>
        </div>

        {quickError && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {quickError}
          </div>
        )}

        <form onSubmit={handleQuickAddProject} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Category *
              </label>
              <select
                value={quickCategory}
                onChange={(e) => {
                  setQuickCategory(e.target.value);
                  setQuickTechnology("");
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="" disabled>Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                placeholder="Enter project title"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technology / Platform *
              </label>
              <select
                value={quickTechnology}
                onChange={(e) => setQuickTechnology(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {availableTechForQuick.length === 0 ? (
                  <option value="">No tech for this category</option>
                ) : (
                  availableTechForQuick.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Website URL *
              </label>
              <input
                type="text"
                required
                value={quickProjectUrl}
                onChange={(e) => setQuickProjectUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes / Description (Optional)
              </label>
              <input
                type="text"
                value={quickDescription}
                onChange={(e) => setQuickDescription(e.target.value)}
                placeholder="Optional brief note..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={quickLoading}
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {quickLoading ? "Adding..." : "Add Project"}
            </button>
          </div>
        </form>
      </div>

      {/* 4 Main Stats Cards (matching screenshot) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Categories */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Categories</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.totalCategories}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Folder className="h-5 w-5 fill-blue-100" />
          </div>
        </div>

        {/* Total Projects */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Projects</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.totalProjects}</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <FileCode className="h-5 w-5" />
          </div>
        </div>

        {/* Active Projects */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Active Projects</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.activeProjects}</div>
          </div>
          <div className="flex h-3 w-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200 mr-2" />
        </div>

        {/* Inactive Projects */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Inactive Projects</span>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.inactiveProjects}</div>
          </div>
          <div className="flex h-3 w-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200 mr-2" />
        </div>
      </div>

      {/* Categories Table Section (matching screenshot) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Categories</h2>
          <button
            onClick={handleOpenAddCategory}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3 w-12">#</th>
                <th className="px-6 py-3">Category Name</th>
                <th className="px-6 py-3">Projects</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 text-xs text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">
                    <Link href={`/admin/categories`} className="hover:text-blue-600">
                      {cat.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-600">
                    {cat._count.projects}
                  </td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                        cat.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {cat.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePrompt("category", cat.id, cat.name)}
                        className="rounded p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projects Table Section (matching screenshot) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Projects</h2>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3 w-12">#</th>
                <th className="px-6 py-3">Project Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Technology</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentProjects.map((project, idx) => (
                <tr key={project.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-3.5 text-xs text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-3.5 font-semibold text-slate-900">
                    <Link href={`/admin/projects/${project.id}/edit`} className="hover:text-blue-600">
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-6 py-3.5 text-xs text-slate-600">{project.category.name}</td>
                  <td className="px-6 py-3.5 text-xs text-slate-600">{project.technology.name}</td>
                  <td className="px-6 py-3.5">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                        project.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {project.status === "ACTIVE" ? "Active" : project.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/admin/projects/${project.id}/edit`}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        title="Edit project"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeletePrompt("project", project.id, project.name)}
                        className="rounded p-1 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Delete project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={catModalOpen}
        category={editingCategory}
        onClose={() => setCatModalOpen(false)}
        onSuccess={() => router.refresh()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title={`Delete ${deleteTarget?.type === "category" ? "Category" : "Project"}?`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        warningNotice={deleteWarning}
        isLoading={deleteLoading}
        onCancel={() => {
          setDeleteModalOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={() => executeDelete(Boolean(deleteWarning))}
      />
    </div>
  );
}
