"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { ConfirmModal } from "./ConfirmModal";

interface CategoryOption {
  id: string;
  name: string;
}

interface TechnologyOption {
  id: string;
  name: string;
  categoryId: string;
}

interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  projectUrl: string;
  status: string;
  featured: boolean;
  categoryId: string;
  technologyId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  technology: {
    id: string;
    name: string;
    slug: string;
  };
}

interface ProjectListClientProps {
  initialProjects: ProjectItem[];
  categories: CategoryOption[];
  technologies: TechnologyOption[];
}

export function ProjectListClient({
  initialProjects,
  categories,
  technologies,
}: ProjectListClientProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTech, setSelectedTech] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Available technologies based on category filter
  const availableTechnologies = useMemo(() => {
    if (selectedCategory === "all") return technologies;
    return technologies.filter((t) => t.categoryId === selectedCategory);
  }, [selectedCategory, technologies]);

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const qClean = q.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "");
        const projectUrlClean = p.projectUrl?.toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/+$/, "") || "";

        const matches =
          p.name.toLowerCase().includes(q) ||
          p.projectUrl?.toLowerCase().includes(q) ||
          (qClean.length > 0 && projectUrlClean.includes(qClean)) ||
          p.category.name.toLowerCase().includes(q) ||
          p.technology.name.toLowerCase().includes(q);

        if (!matches) {
          return false;
        }
      }
      if (selectedCategory !== "all" && p.categoryId !== selectedCategory) {
        return false;
      }
      if (selectedTech !== "all" && p.technologyId !== selectedTech) {
        return false;
      }
      if (selectedStatus !== "all" && p.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [initialProjects, search, selectedCategory, selectedTech, selectedStatus]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/projects/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete project");
      }

      toast.success("Project deleted successfully!");
      setDeleteModalOpen(false);
      setDeleteTarget(null);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleFeatured = async (project: ProjectItem) => {
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...project,
          featured: !project.featured,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(!project.featured ? "Project marked as featured!" : "Project unfeatured!");
      router.refresh();
    } catch (e) {
      toast.error("Error updating featured status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Publish, edit, and organize all projects in your portfolio.
          </p>
        </div>

        <Link
          href="/admin/projects/new"
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Project</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, website/app URL, category, or tech..."
            className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedTech("all");
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Technology Filter */}
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Technologies</option>
            {availableTechnologies.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Project Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Technology</th>
                <th className="px-6 py-3.5 text-center">Featured</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No projects found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{project.name}</div>
                      <div className="text-xs font-mono text-slate-400">{project.slug}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      {project.category.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800">
                        {project.technology.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(project)}
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-colors ${
                          project.featured
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-slate-100 text-slate-400 hover:text-slate-600"
                        }`}
                        title="Click to toggle featured"
                      >
                        <Sparkles className={`h-3 w-3 ${project.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                        <span>{project.featured ? "Featured" : "Standard"}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                          project.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : project.status === "DRAFT"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {project.status === "ACTIVE" ? "Active" : project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          title="View on public site"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                          title="Edit project"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => {
                            setDeleteTarget(project);
                            setDeleteModalOpen(true);
                          }}
                          className="rounded p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          title="Delete project"
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

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
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
