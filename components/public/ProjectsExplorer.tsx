"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectCard } from "@/components/public/ProjectCard";
import { Search, Filter, X, Sparkles, Folder, Cpu } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface TechnologyOption {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface ProjectItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
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

interface ProjectsExplorerProps {
  initialProjects: ProjectItem[];
  categories: CategoryOption[];
  technologies: TechnologyOption[];
  initialSearch?: string;
  initialCategory?: string;
  initialTechnology?: string;
  initialFeatured?: boolean;
}

export function ProjectsExplorer({
  initialProjects,
  categories,
  technologies,
  initialSearch = "",
  initialCategory = "all",
  initialTechnology = "all",
  initialFeatured = false,
}: ProjectsExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || initialCategory
  );
  const [selectedTech, setSelectedTech] = useState(
    searchParams.get("tech") || initialTechnology
  );
  const [featuredOnly, setFeaturedOnly] = useState(
    searchParams.get("featured") === "true" || initialFeatured
  );

  // Available technologies based on category filter
  const filteredTechOptions = useMemo(() => {
    if (selectedCategory === "all") return technologies;
    const catObj = categories.find((c) => c.slug === selectedCategory);
    if (!catObj) return technologies;
    return technologies.filter((t) => t.categoryId === catObj.id);
  }, [selectedCategory, categories, technologies]);

  // Client-side filtering of initialProjects
  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(q);
        const matchesDesc = project.shortDescription.toLowerCase().includes(q);
        const matchesCat = project.category?.name.toLowerCase().includes(q);
        const matchesTech = project.technology?.name.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat && !matchesTech) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all") {
        if (project.category.slug !== selectedCategory) {
          return false;
        }
      }

      // Technology filter
      if (selectedTech !== "all") {
        if (project.technology.slug !== selectedTech) {
          return false;
        }
      }

      // Featured filter
      if (featuredOnly && !project.featured) {
        return false;
      }

      return true;
    });
  }, [initialProjects, search, selectedCategory, selectedTech, featuredOnly]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedTech("all");
    updateUrl({ category: slug, tech: "all" });
  };

  const handleTechChange = (slug: string) => {
    setSelectedTech(slug);
    updateUrl({ tech: slug });
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrl({ search: val });
  };

  const handleFeaturedToggle = () => {
    const nextVal = !featuredOnly;
    setFeaturedOnly(nextVal);
    updateUrl({ featured: nextVal ? "true" : undefined });
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setSelectedTech("all");
    setFeaturedOnly(false);
    router.push("/projects");
  };

  const updateUrl = (params: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, val]) => {
      if (val === undefined || val === "" || val === "all") {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });
    router.replace(`/projects?${nextParams.toString()}`, { scroll: false });
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedTech !== "all" ||
    featuredOnly;

  return (
    <div className="space-y-8">
      {/* Search and Filters Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search projects, descriptions, categories or technologies..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {search && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Categories Chips */}
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Folder className="h-3.5 w-3.5" />
            <span>Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCategoryChange("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.slug)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Technology dropdown & Featured toggle */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <Cpu className="h-3.5 w-3.5" />
              <span>Technology:</span>
            </div>
            <select
              value={selectedTech}
              onChange={(e) => handleTechChange(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Technologies ({filteredTechOptions.length})</option>
              {filteredTechOptions.map((t) => (
                <option key={t.id} value={t.slug}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleFeaturedToggle}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                featuredOnly
                  ? "border-amber-300 bg-amber-50 text-amber-900"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Sparkles className={`h-3.5 w-3.5 ${featuredOnly ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
              <span>Featured Only</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filteredProjects.length}</span>{" "}
          {filteredProjects.length === 1 ? "project" : "projects"}
        </p>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Filter className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">No projects match your criteria</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing your filters, or browsing other categories.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
