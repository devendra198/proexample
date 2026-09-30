"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { slugify, formatUrl } from "@/lib/utils";
import { Globe, AlertCircle, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
}

interface TechnologyOption {
  id: string;
  name: string;
  categoryId: string;
}

interface ProjectLinkItem {
  id?: string;
  label: string;
  url: string;
}

interface InitialProjectData {
  id?: string;
  name: string;
  slug?: string;
  categoryId: string;
  technologyId: string;
  shortDescription?: string;
  description?: string;
  projectUrl: string;
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  githubUrl?: string | null;
  imageUrl?: string | null;
  featured?: boolean;
  status?: "ACTIVE" | "INACTIVE" | "DRAFT";
  sortOrder?: number;
  links?: ProjectLinkItem[];
}

interface ProjectFormProps {
  categories: CategoryOption[];
  technologies: TechnologyOption[];
  initialData?: InitialProjectData;
  isEditing?: boolean;
}

export function ProjectForm({
  categories,
  technologies,
  initialData,
  isEditing = false,
}: ProjectFormProps) {
  const router = useRouter();

  // Core Compulsory Fields
  const [name, setName] = useState(initialData?.name || "");
  const [projectUrl, setProjectUrl] = useState(initialData?.projectUrl || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || (categories[0]?.id || ""));
  const [technologyId, setTechnologyId] = useState(initialData?.technologyId || "");

  // Optional Fields
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [githubUrl, setGithubUrl] = useState(initialData?.githubUrl || "");
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "DRAFT">(initialData?.status || "ACTIVE");
  const [links, setLinks] = useState<ProjectLinkItem[]>(initialData?.links || []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter technologies by currently selected category
  const availableTechnologies = useMemo(() => {
    if (!categoryId) return [];
    return technologies.filter((t) => t.categoryId === categoryId);
  }, [categoryId, technologies]);

  useEffect(() => {
    if (availableTechnologies.length > 0) {
      const exists = availableTechnologies.some((t) => t.id === technologyId);
      if (!exists) {
        setTechnologyId(availableTechnologies[0].id);
      }
    } else {
      setTechnologyId("");
    }
  }, [categoryId, availableTechnologies, technologyId]);

  const addLink = () => {
    setLinks([...links, { label: "", url: "" }]);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const validLinks = links.filter((l) => l.label.trim() && l.url.trim());

    const payload = {
      name: name.trim(),
      projectUrl: formatUrl(projectUrl),
      categoryId,
      technologyId: technologyId || availableTechnologies[0]?.id,
      slug: slugify(name) + "-" + Math.random().toString(36).substring(2, 6),
      shortDescription: shortDescription.trim() || name.trim(),
      description: description.trim() || name.trim(),
      githubUrl: githubUrl.trim() || null,
      imageUrl: imageUrl.trim() || null,
      featured,
      status,
      sortOrder: 0,
      links: validLinks,
    };

    try {
      const url = isEditing ? `/api/projects/${initialData?.id}` : "/api/projects";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save project");
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Main simple card: Only Compulsory Fields */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? "Edit Project" : "Add Project"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Only Project Name and URL are required to publish.
          </p>
        </div>

        {/* Category & Technology Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Technology / Platform *
            </label>
            <select
              required
              value={technologyId}
              onChange={(e) => setTechnologyId(e.target.value)}
              disabled={availableTechnologies.length === 0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            >
              {availableTechnologies.length === 0 ? (
                <option value="">No tech for this category</option>
              ) : (
                availableTechnologies.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Project Name (Compulsory) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Project Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Auteur Wines or Ruby Love"
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Project URL (Compulsory) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Project Website URL *
          </label>
          <div className="relative">
            <Globe className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="https://auteurwines.com/ or domain.com"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Optional Collapsible Details */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors py-1"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span>{showAdvanced ? "Hide Optional Details" : "Add Optional Description, GitHub or Extra Links"}</span>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Short Description (Optional)
                </label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="e.g. Fine wine boutique website on WordPress"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  GitHub / Source Code URL (Optional)
                </label>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Image URL (Optional)
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Additional Repeater Links */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Additional Links (Optional)
                  </label>
                  <button
                    type="button"
                    onClick={addLink}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Link</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {links.map((link, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={link.label}
                        onChange={(e) => updateLink(idx, "label", e.target.value)}
                        placeholder="Label (e.g. Case Study)"
                        className="w-1/3 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={link.url}
                        onChange={(e) => updateLink(idx, "url", e.target.value)}
                        placeholder="https://..."
                        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => router.push("/admin/projects")}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Saving..." : isEditing ? "Save Project" : "Add Project"}
          </button>
        </div>
      </div>
    </form>
  );
}
