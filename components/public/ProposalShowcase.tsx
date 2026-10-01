"use client";

import { useState, useMemo, useEffect } from "react";
import { Copy, Check, ExternalLink, Search, Filter, Pin, User, X, FileText, Eye, EyeOff } from "lucide-react";

interface ProjectItem {
  id: string;
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  projectUrl: string;
  appStoreUrl?: string | null;
  playStoreUrl?: string | null;
  featured?: boolean;
}

interface TechnologyGroup {
  id: string;
  name: string;
  slug: string;
  projects: ProjectItem[];
}

interface CategoryGroup {
  id: string;
  name: string;
  slug: string;
  technologies: TechnologyGroup[];
}

interface DeveloperPortfolio {
  id: string;
  name: string;
  url: string;
  role: string;
}

const DEVELOPER_PORTFOLIOS: DeveloperPortfolio[] = [
  { id: "dev-1", name: "Jeet", url: "https://jeetofficial.in/", role: "Full-Stack Developer" },
  { id: "dev-2", name: "Krishan", url: "https://krishanofficial.in/", role: "Full-Stack Developer" },
  { id: "dev-3", name: "Kahan Singh", url: "https://kahansingh.in/", role: "Web Designer" },
  { id: "dev-4", name: "Adarsh", url: "https://adarshofficial.in/", role: "Web & Mobile Full-Stack Developer" },
  { id: "dev-5", name: "Devendra Singh", url: "https://devendrasingh.co.in/", role: "Web & Mobile Full-Stack Developer" },
];

interface ProposalShowcaseProps {
  categories: CategoryGroup[];
  developerPortfolios?: DeveloperPortfolio[];
}

function normalizeUrlString(url?: string | null): string {
  if (!url) return "";
  return url
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "");
}

interface CategoryThemeConfig {
  icon: string;
  pillInactive: string;
  pillActive: string;
  cardBorder: string;
  topBarGradient: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

function getCategoryTheme(slug: string): CategoryThemeConfig {
  const lower = slug.toLowerCase();
  if (lower.includes("design")) {
    return {
      icon: "🎨",
      pillInactive: "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200",
      pillActive: "bg-purple-600 text-white shadow-sm ring-2 ring-purple-300",
      cardBorder: "border-purple-900/50 hover:border-purple-600/60 shadow-purple-950/20",
      topBarGradient: "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500",
      badgeBg: "bg-purple-500/15",
      badgeText: "text-purple-300",
      badgeBorder: "border-purple-500/30",
    };
  }
  if (lower.includes("dev") && !lower.includes("app")) {
    return {
      icon: "⚡",
      pillInactive: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200",
      pillActive: "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300",
      cardBorder: "border-emerald-900/50 hover:border-emerald-600/60 shadow-emerald-950/20",
      topBarGradient: "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500",
      badgeBg: "bg-emerald-500/15",
      badgeText: "text-emerald-300",
      badgeBorder: "border-emerald-500/30",
    };
  }
  if (lower.includes("app") || lower.includes("mobile")) {
    return {
      icon: "📱",
      pillInactive: "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200",
      pillActive: "bg-amber-600 text-white shadow-sm ring-2 ring-amber-300",
      cardBorder: "border-amber-900/50 hover:border-amber-600/60 shadow-amber-950/20",
      topBarGradient: "bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500",
      badgeBg: "bg-amber-500/15",
      badgeText: "text-amber-300",
      badgeBorder: "border-amber-500/30",
    };
  }
  return {
    icon: "📂",
    pillInactive: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200",
    pillActive: "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300",
    cardBorder: "border-indigo-900/50 hover:border-indigo-600/60 shadow-indigo-950/20",
    topBarGradient: "bg-gradient-to-r from-indigo-500 via-sky-500 to-blue-500",
    badgeBg: "bg-indigo-500/15",
    badgeText: "text-indigo-300",
    badgeBorder: "border-indigo-500/30",
  };
}

const devPortfoliosTheme = {
  icon: "👨‍💻",
  pillInactive: "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200",
  pillActive: "bg-blue-600 text-white shadow-sm ring-2 ring-blue-300",
  cardBorder: "border-blue-900/50 hover:border-blue-600/60 shadow-blue-950/20",
  topBarGradient: "bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500",
  badgeBg: "bg-blue-500/15",
  badgeText: "text-blue-300",
  badgeBorder: "border-blue-500/30",
};

export function ProposalShowcase({
  categories,
  developerPortfolios = DEVELOPER_PORTFOLIOS,
}: ProposalShowcaseProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [includeNames, setIncludeNames] = useState(false);
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>("all");

  // Read saved preference from localStorage if available, default to true
  useEffect(() => {
    try {
      const saved = localStorage.getItem("proposal_show_details");
      if (saved !== null) {
        setShowDetails(saved === "true");
      }
    } catch {
      // Fallback
    }
  }, []);

  const toggleShowDetails = () => {
    setShowDetails((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("proposal_show_details", String(next));
      } catch { }
      return next;
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  // Filter developer portfolios by search (name, URL, role)
  const filteredDevelopers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const source = developerPortfolios && developerPortfolios.length > 0 ? developerPortfolios : DEVELOPER_PORTFOLIOS;
    if (!q) return source;
    const qClean = normalizeUrlString(q);

    return source.filter((d) => {
      const dUrlClean = normalizeUrlString(d.url);
      return (
        d.name.toLowerCase().includes(q) ||
        d.url.toLowerCase().includes(q) ||
        (qClean.length > 0 && dUrlClean.includes(qClean)) ||
        (d.role && d.role.toLowerCase().includes(q))
      );
    });
  }, [search, developerPortfolios]);

  // Filter project categories by search and subcategory (technology)
  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qClean = normalizeUrlString(q);

    return categories
      .map((cat) => {
        if (selectedFilter !== "all" && selectedFilter !== "all-projects" && cat.slug !== selectedFilter) {
          return null;
        }

        const filteredTechs = cat.technologies
          .filter((tech) => {
            if (selectedFilter !== "all" && selectedSubFilter !== "all") {
              return tech.slug === selectedSubFilter || tech.id === selectedSubFilter;
            }
            return true;
          })
          .map((tech) => {
            const techMatches = tech.name.toLowerCase().includes(q);
            const filteredProjects = tech.projects.filter((p) => {
              if (!q) return true;

              const pUrlClean = normalizeUrlString(p.projectUrl);
              const appStoreClean = normalizeUrlString(p.appStoreUrl);
              const playStoreClean = normalizeUrlString(p.playStoreUrl);

              const urlMatches =
                p.projectUrl.toLowerCase().includes(q) ||
                (qClean.length > 0 && pUrlClean.includes(qClean)) ||
                (p.appStoreUrl && (p.appStoreUrl.toLowerCase().includes(q) || (qClean.length > 0 && appStoreClean.includes(qClean)))) ||
                (p.playStoreUrl && (p.playStoreUrl.toLowerCase().includes(q) || (qClean.length > 0 && playStoreClean.includes(qClean))));

              return (
                techMatches ||
                p.name.toLowerCase().includes(q) ||
                (p.description && p.description.toLowerCase().includes(q)) ||
                urlMatches ||
                cat.name.toLowerCase().includes(q)
              );
            });

            if (filteredProjects.length === 0) return null;

            return {
              ...tech,
              projects: filteredProjects,
            };
          })
          .filter(Boolean) as TechnologyGroup[];

        if (filteredTechs.length === 0) return null;

        return {
          ...cat,
          technologies: filteredTechs,
        };
      })
      .filter(Boolean) as CategoryGroup[];
  }, [categories, search, selectedFilter, selectedSubFilter]);

  // Generate text for a single project WITH details
  const generateProjectWithDetails = (project: ProjectItem, index?: number) => {
    const numPrefix = index ? `${index}. ` : "";
    const isApp = Boolean(project.appStoreUrl || project.playStoreUrl);

    if (isApp) {
      const lines = [`${numPrefix}${project.name}`];
      if (
        project.description &&
        project.description.trim() !== "" &&
        project.description.trim() !== project.name.trim()
      ) {
        lines.push(project.description.trim());
      }
      if (project.appStoreUrl) lines.push(`iOS: ${project.appStoreUrl}`);
      if (project.playStoreUrl) lines.push(`Android: ${project.playStoreUrl}`);
      if (
        project.projectUrl &&
        !project.projectUrl.includes("apple.com") &&
        !project.projectUrl.includes("play.google.com")
      ) {
        lines.push(`Website: ${project.projectUrl}`);
      }
      return lines.join("\n");
    }

    const hasDescription = Boolean(
      project.description &&
      project.description.trim() !== "" &&
      project.description.trim() !== project.name.trim()
    );

    if (hasDescription && project.description) {
      return `${numPrefix}${project.name}\n${project.description.trim()}\nWebsite: ${project.projectUrl}`;
    }

    return `${numPrefix}${project.name}\nWebsite: ${project.projectUrl}`;
  };

  // Generate text for a single project URL ONLY
  const generateProjectUrlOnly = (project: ProjectItem) => {
    const isApp = Boolean(project.appStoreUrl || project.playStoreUrl);
    if (isApp) {
      const lines = [project.name];
      if (project.appStoreUrl) lines.push(`iOS: ${project.appStoreUrl}`);
      if (project.playStoreUrl) lines.push(`Android: ${project.playStoreUrl}`);
      if (
        project.projectUrl &&
        !project.projectUrl.includes("apple.com") &&
        !project.projectUrl.includes("play.google.com")
      ) {
        lines.push(`Website: ${project.projectUrl}`);
      }
      return lines.join("\n");
    }

    return includeNames ? `${project.name}: ${project.projectUrl}` : project.projectUrl;
  };

  // Generate technology text: URLS ONLY
  const generateTechUrlsOnly = (techName: string, projects: ProjectItem[]) => {
    let header = `Some ${techName} work you can review:`;
    const lower = techName.toLowerCase();
    if (lower === "shopify") {
      header = "shopify";
    } else if (lower.includes("react node") || lower.includes("node express")) {
      header = "React Node Express Web Development";
    } else if (lower.includes("capacitor")) {
      header = "Capacitor App";
    }

    const hasAppLinks = projects.some((p) => p.appStoreUrl || p.playStoreUrl);
    const separator = hasAppLinks ? "\n\n" : "\n";
    const linksText = projects.map((p) => generateProjectUrlOnly(p)).join(separator);
    return `${header}\n\n${linksText}`.trim();
  };

  // Generate technology text: WITH FULL DETAILS
  const generateTechWithDetails = (techName: string, projects: ProjectItem[]) => {
    let header = `Some ${techName} work you can review:`;
    const lower = techName.toLowerCase();
    if (lower === "shopify") {
      header = "shopify";
    } else if (lower.includes("react node") || lower.includes("node express")) {
      header = "React Node Express Web Development";
    } else if (lower.includes("capacitor")) {
      header = "Capacitor App";
    }

    const linksText = projects.map((p, idx) => generateProjectWithDetails(p, idx + 1)).join("\n\n");
    return `${header}\n\n${linksText}`.trim();
  };

  const generateCategoryText = (category: CategoryGroup, withDetails = false) => {
    let lines = [`${category.name}\n`];

    category.technologies.forEach((tech) => {
      lines.push(withDetails ? generateTechWithDetails(tech.name, tech.projects) : generateTechUrlsOnly(tech.name, tech.projects));
      lines.push("");
    });

    return lines.join("\n").trim();
  };

  const allDevsCopyText = useMemo(() => {
    return (
      "Our Developer Portfolios:\n" +
      DEVELOPER_PORTFOLIOS.map((d) => (includeNames ? `${d.name}: ${d.url}` : d.url)).join("\n")
    );
  }, [includeNames]);

  const showDevSection =
    selectedFilter === "all" || selectedFilter === "portfolios";
  const showProjectSections =
    selectedFilter === "all" ||
    selectedFilter === "all-projects" ||
    (selectedFilter !== "portfolios" && filteredCategories.length > 0);

  return (
    <div className="space-y-6">
      {/* Live Search and Quick Action Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by URL (e.g. alexruschinstitut.com, swapco.com.au), project name, tech, or developer..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-11 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-500 mr-0.5">View:</span>
            <button
              onClick={() => {
                setSelectedFilter("all");
                setSelectedSubFilter("all");
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${selectedFilter === "all"
                  ? "bg-slate-900 text-white shadow-sm ring-2 ring-slate-300"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                }`}
            >
              <span>🌐</span>
              <span>All Sections</span>
            </button>
            <button
              onClick={() => {
                setSelectedFilter("portfolios");
                setSelectedSubFilter("all");
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${selectedFilter === "portfolios"
                  ? devPortfoliosTheme.pillActive
                  : devPortfoliosTheme.pillInactive
                }`}
            >
              <span>{devPortfoliosTheme.icon}</span>
              <span>Developer Portfolios</span>
              <span
                className={`text-[10px] rounded-full px-1.5 py-0.2 font-bold ${selectedFilter === "portfolios"
                    ? "bg-white/20 text-white"
                    : "bg-white/80 text-blue-800 border border-blue-200"
                  }`}
              >
                {filteredDevelopers.length}
              </span>
            </button>
            {categories.map((c) => {
              const theme = getCategoryTheme(c.slug);
              const count = c.technologies.reduce((sum, t) => sum + t.projects.length, 0);
              const isSelected = selectedFilter === c.slug;

              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedFilter(c.slug);
                    setSelectedSubFilter("all");
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${isSelected ? theme.pillActive : theme.pillInactive
                    }`}
                >
                  <span>{theme.icon}</span>
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] rounded-full px-1.5 py-0.2 font-bold ${isSelected
                        ? "bg-white/20 text-white"
                        : "bg-white/80 text-slate-700 border border-slate-200"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Proposal Format & Details Toggle Options */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-600">
            <button
              type="button"
              onClick={toggleShowDetails}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all border ${showDetails
                  ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 shadow-xs"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              title={
                showDetails
                  ? "Details buttons are enabled by default (Click to hide)"
                  : "Details buttons are hidden (Click to show)"
              }
            >
              <Eye className={`h-3.5 w-3.5 ${showDetails ? "text-slate-700" : "text-slate-400"}`} />
              <span>Show Details Buttons</span>
              <span
                className={`text-[10px] font-medium px-1 py-0.2 rounded ${showDetails
                    ? "bg-slate-200 text-slate-700"
                    : "text-slate-400"
                  }`}
              >
                {showDetails ? "ON" : "OFF"}
              </span>
            </button>

            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeNames}
                onChange={(e) => setIncludeNames(e.target.checked)}
                className="h-3.5 w-3.5 rounded text-blue-600"
              />
              <span>Include titles/names when copying</span>
            </label>
          </div>
        </div>

        {/* Subcategory Pills Bar (When a specific category like Web Design, Web Dev, or App Dev is selected) */}
        {(() => {
          const activeCategory = categories.find((c) => c.slug === selectedFilter);
          if (!activeCategory || activeCategory.technologies.length === 0) return null;
          const theme = getCategoryTheme(activeCategory.slug);
          const totalCategoryProjects = activeCategory.technologies.reduce(
            (sum, t) => sum + t.projects.length,
            0
          );

          return (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-slate-500 flex items-center gap-1 mr-0.5">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>Subcategory:</span>
              </span>

              <button
                onClick={() => setSelectedSubFilter("all")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${selectedSubFilter === "all"
                    ? theme.pillActive
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
              >
                <span>All {activeCategory.name}</span>
                <span
                  className={`text-[10px] rounded-full px-1.5 py-0.2 font-bold ${selectedSubFilter === "all"
                      ? "bg-white/20 text-white"
                      : "bg-white/80 text-slate-700 border border-slate-200"
                    }`}
                >
                  {totalCategoryProjects}
                </span>
              </button>

              {activeCategory.technologies.map((tech) => {
                const isSelected = selectedSubFilter === tech.slug || selectedSubFilter === tech.id;

                return (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedSubFilter(tech.slug)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${isSelected
                        ? theme.pillActive
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
                      }`}
                  >
                    <span>{tech.name}</span>
                    <span
                      className={`text-[10px] rounded-full px-1.5 py-0.2 font-bold ${isSelected
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                    >
                      {tech.projects.length}
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Full-Width Landscape Proposal Sheets */}
      <div className="space-y-8">
        {/* SEPARATE DEVELOPER PORTFOLIOS SECTION */}
        {showDevSection && filteredDevelopers.length > 0 && (
          <div className="relative rounded-2xl bg-[#1b1c1e] text-slate-100 p-6 sm:p-7 shadow-xl border border-blue-900/40 hover:border-blue-600/50 transition-all font-sans overflow-hidden">
            {/* Decorative top accent glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5 pt-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-500/15 text-blue-300 border border-blue-500/30">
                    <span>👨‍💻</span>
                    <span>Developer Portfolios</span>
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {filteredDevelopers.length} Profiles
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Developer Portfolios</span>
                </h2>
                <span className="text-[11px] text-slate-400">
                  Individual portfolio links ready to copy into proposals
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(allDevsCopyText, "devs-all")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${copiedId === "devs-all"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                    }`}
                  title="Copy all developer portfolios for proposal"
                >
                  {copiedId === "devs-all" ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copied All!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-blue-400" />
                      <span>Copy All Portfolios</span>
                    </>
                  )}
                </button>
                <div className="text-slate-500">
                  <Pin className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* List of Developer Portfolios with Separate Copy Buttons in Landscape Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredDevelopers.map((dev) => {
                const isCopied = copiedId === `dev-${dev.id}`;
                const copyText = includeNames ? `${dev.name}: ${dev.url}` : dev.url;

                return (
                  <div
                    key={dev.id}
                    className="flex flex-col justify-between gap-2.5 rounded-xl bg-slate-900/60 p-3.5 border border-slate-800/70 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-200">{dev.name}</span>
                        <span className="text-[10px] rounded bg-slate-800 px-2 py-0.5 text-slate-400 border border-slate-700">
                          {dev.role}
                        </span>
                      </div>
                      <a
                        href={dev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 break-all font-mono"
                      >
                        {dev.url}
                      </a>
                    </div>

                    {/* Separate Copy Button for each portfolio link */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
                      <button
                        onClick={() => handleCopy(copyText, `dev-${dev.id}`)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700 shadow-sm"
                          }`}
                        title={`Copy ${dev.name}'s portfolio link`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5 text-blue-400" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>

                      <a
                        href={dev.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        title="Open in new tab"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CATEGORY WORK SECTIONS (Web Design, Web Development, App Development, etc.) */}
        {showProjectSections &&
          filteredCategories.map((category) => {
            const theme = getCategoryTheme(category.slug);
            const categoryUrlsOnlyText = generateCategoryText(category, false);
            const categoryDetailsText = generateCategoryText(category, true);
            const isCategoryCopied = copiedId === `cat-${category.id}`;
            const isCategoryDetailsCopied = copiedId === `cat-details-${category.id}`;
            const totalProjects = category.technologies.reduce((sum, t) => sum + t.projects.length, 0);

            return (
              <div
                key={category.id}
                className={`relative rounded-2xl bg-[#1b1c1e] text-slate-100 p-6 sm:p-7 shadow-xl border ${theme.cardBorder} transition-all font-sans overflow-hidden`}
              >
                {/* Decorative top accent glow bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${theme.topBarGradient}`} />

                {/* Note Top Bar */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5 pt-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}
                      >
                        <span>{theme.icon}</span>
                        <span>{category.name}</span>
                        {selectedSubFilter !== "all" && category.technologies.length === 1 && (
                          <span className="font-normal opacity-90">› {category.technologies[0].name}</span>
                        )}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {totalProjects} Work Samples
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>{selectedSubFilter !== "all" && category.technologies.length === 1 ? category.technologies[0].name : category.name}</span>
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      Ready to copy directly into proposals
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleCopy(categoryUrlsOnlyText, `cat-${category.id}`)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${isCategoryCopied
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-800 text-slate-200 hover:bg-blue-600 hover:text-white border border-slate-700"
                        }`}
                      title="Copy all links in this category (URLs only)"
                    >
                      {isCategoryCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Copied All Links!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-blue-400" />
                          <span>Copy All Links</span>
                        </>
                      )}
                    </button>

                    {showDetails && (
                      <button
                        onClick={() => handleCopy(categoryDetailsText, `cat-details-${category.id}`)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${isCategoryDetailsCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-800 text-slate-200 hover:bg-indigo-600 hover:text-white border border-slate-700"
                          }`}
                        title="Copy all projects in this category with full details"
                      >
                        {isCategoryDetailsCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Copied All Details!</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Copy with Details</span>
                          </>
                        )}
                      </button>
                    )}

                    <div className="text-slate-500 hidden sm:block">
                      <Pin className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Technologies and Project Lists */}
                <div className="space-y-6">
                  {category.technologies.map((tech) => {
                    const techUrlsOnlyText = generateTechUrlsOnly(tech.name, tech.projects);
                    const techDetailsText = generateTechWithDetails(tech.name, tech.projects);
                    const isTechCopied = copiedId === `tech-${tech.id}`;
                    const isTechDetailsCopied = copiedId === `tech-details-${tech.id}`;

                    let techHeading = `Some ${tech.name} work you can review:`;
                    const lower = tech.name.toLowerCase();
                    if (lower === "shopify") {
                      techHeading = "shopify";
                    } else if (lower.includes("react node") || lower.includes("node express")) {
                      techHeading = "React Node Express Web Development";
                    } else if (lower.includes("capacitor")) {
                      techHeading = "Capacitor App";
                    }

                    return (
                      <div
                        key={tech.id}
                        className="group relative rounded-xl bg-slate-900/40 p-4 border border-slate-800/50 hover:border-slate-700 transition-colors"
                      >
                        {/* Technology Heading + Copy Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                          <h3 className="text-sm sm:text-base font-semibold text-slate-200">
                            {techHeading}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(techUrlsOnlyText, `tech-${tech.id}`)}
                              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${isTechCopied
                                  ? "bg-emerald-600 text-white"
                                  : "bg-slate-800/90 text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-700"
                                }`}
                              title={`Copy ${tech.name} URLs only`}
                            >
                              {isTechCopied ? (
                                <>
                                  <Check className="h-3 w-3" />
                                  <span>Copied Links!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 text-blue-400" />
                                  <span>Copy {tech.name} Links</span>
                                </>
                              )}
                            </button>

                            {showDetails && (
                              <button
                                onClick={() => handleCopy(techDetailsText, `tech-details-${tech.id}`)}
                                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${isTechDetailsCopied
                                    ? "bg-emerald-600 text-white"
                                    : "bg-slate-800/90 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700"
                                  }`}
                                title={`Copy ${tech.name} with full details`}
                              >
                                {isTechDetailsCopied ? (
                                  <>
                                    <Check className="h-3 w-3" />
                                    <span>Copied Details!</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-3 w-3 text-indigo-400" />
                                    <span>Copy with Details</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* List of project URLs in Landscape Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pl-1">
                          {tech.projects.map((project, idx) => {
                            const isApp = Boolean(project.appStoreUrl || project.playStoreUrl);

                            if (isApp) {
                              const appUrlsOnlyText = generateProjectUrlOnly(project);
                              const appDetailsText = generateProjectWithDetails(project, idx + 1);
                              const isAppCopied = copiedId === `proj-app-${project.id}`;
                              const isAppDetailsCopied = copiedId === `proj-app-details-${project.id}`;
                              const hasAppDescription = Boolean(
                                project.description &&
                                project.description.trim() !== "" &&
                                project.description.trim() !== project.name.trim()
                              );

                              return (
                                <div
                                  key={project.id}
                                  className="rounded-xl bg-slate-950/70 p-3.5 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2.5"
                                >
                                  <div className="flex items-center justify-between gap-2 border-b border-slate-800/70 pb-2">
                                    <span className="font-bold text-sm text-slate-100">
                                      {project.name}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {showDetails && (
                                        <button
                                          onClick={() => handleCopy(appDetailsText, `proj-app-details-${project.id}`)}
                                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${isAppDetailsCopied
                                              ? "bg-emerald-600 text-white shadow-sm"
                                              : "bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700"
                                            }`}
                                          title="Copy app with full details (Features, Technology & URLs)"
                                        >
                                          {isAppDetailsCopied ? (
                                            <>
                                              <Check className="h-3 w-3" />
                                              <span>Copied Details!</span>
                                            </>
                                          ) : (
                                            <>
                                              <FileText className="h-3 w-3 text-indigo-400" />
                                              <span>Copy with Details</span>
                                            </>
                                          )}
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleCopy(appUrlsOnlyText, `proj-app-${project.id}`)}
                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${isAppCopied
                                            ? "bg-emerald-600 text-white"
                                            : "bg-slate-800 text-slate-300 hover:bg-blue-600 hover:text-white border border-slate-700"
                                          }`}
                                        title="Copy all URLs for this app"
                                      >
                                        {isAppCopied ? (
                                          <>
                                            <Check className="h-3 w-3" />
                                            <span>Copied App!</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="h-3 w-3 text-blue-400" />
                                            <span>Copy App Links</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 pl-1 text-xs">
                                    {project.appStoreUrl && (
                                      <div className="flex items-center justify-between group/applink hover:bg-slate-800/40 px-2 py-1 rounded transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <span className="font-semibold text-slate-400 w-16 flex-shrink-0">
                                            iOS:
                                          </span>
                                          <a
                                            href={project.appStoreUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 truncate font-mono"
                                          >
                                            {project.appStoreUrl}
                                          </a>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                          <button
                                            onClick={() => handleCopy(project.appStoreUrl!, `ios-${project.id}`)}
                                            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                            title="Copy iOS App URL"
                                          >
                                            {copiedId === `ios-${project.id}` ? (
                                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                                            ) : (
                                              <Copy className="h-3.5 w-3.5" />
                                            )}
                                          </button>
                                          <a
                                            href={project.appStoreUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                            title="Open iOS link"
                                          >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                          </a>
                                        </div>
                                      </div>
                                    )}

                                    {project.playStoreUrl && (
                                      <div className="flex items-center justify-between group/applink hover:bg-slate-800/40 px-2 py-1 rounded transition-colors">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <span className="font-semibold text-slate-400 w-16 flex-shrink-0">
                                            Android:
                                          </span>
                                          <a
                                            href={project.playStoreUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sky-400 hover:text-sky-300 underline underline-offset-2 truncate font-mono"
                                          >
                                            {project.playStoreUrl}
                                          </a>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                          <button
                                            onClick={() => handleCopy(project.playStoreUrl!, `android-${project.id}`)}
                                            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                            title="Copy Android App URL"
                                          >
                                            {copiedId === `android-${project.id}` ? (
                                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                                            ) : (
                                              <Copy className="h-3.5 w-3.5" />
                                            )}
                                          </button>
                                          <a
                                            href={project.playStoreUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                            title="Open Android link"
                                          >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                          </a>
                                        </div>
                                      </div>
                                    )}

                                    {project.projectUrl &&
                                      !project.projectUrl.includes("apple.com") &&
                                      !project.projectUrl.includes("play.google.com") && (
                                        <div className="flex items-center justify-between group/applink hover:bg-slate-800/40 px-2 py-1 rounded transition-colors">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                            <span className="font-semibold text-slate-400 w-16 flex-shrink-0">
                                              Website:
                                            </span>
                                            <a
                                              href={project.projectUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sky-400 hover:text-sky-300 underline underline-offset-2 truncate font-mono"
                                            >
                                              {project.projectUrl}
                                            </a>
                                          </div>
                                          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                            <button
                                              onClick={() => handleCopy(project.projectUrl, `web-${project.id}`)}
                                              className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                              title="Copy Website URL"
                                            >
                                              {copiedId === `web-${project.id}` ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                                              ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                              )}
                                            </button>
                                            <a
                                              href={project.projectUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                              title="Open website link"
                                            >
                                              <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                </div>
                              );
                            }

                            // Regular Web Projects: clean URL line with optional details copy
                            const hasDescription = Boolean(
                              project.description &&
                              project.description.trim() !== "" &&
                              project.description.trim() !== project.name.trim()
                            );
                            const projectDetailSnippet = `${idx + 1}. ${project.name}\n${hasDescription ? project.description!.trim() + "\n" : ""}Website: ${project.projectUrl}`;
                            const isDetailCopied = copiedId === `proj-detail-${project.id}`;
                            const isUrlCopied = copiedId === `proj-${project.id}`;

                            return (
                              <div
                                key={project.id}
                                className="flex items-center justify-between group/link hover:bg-slate-800/60 bg-slate-900/50 border border-slate-800/70 px-3.5 py-2.5 rounded-xl transition-colors"
                              >
                                <div className="flex items-center gap-2 overflow-hidden min-w-0 flex-1">
                                  <a
                                    href={project.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2 truncate font-mono"
                                    title={project.projectUrl}
                                  >
                                    {project.projectUrl}
                                  </a>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                  {showDetails && (
                                    <button
                                      onClick={() => handleCopy(projectDetailSnippet, `proj-detail-${project.id}`)}
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${isDetailCopied
                                          ? "bg-emerald-600 text-white shadow-sm"
                                          : "bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white border border-slate-700"
                                        }`}
                                      title="Copy with details (Title, Description & URL)"
                                    >
                                      {isDetailCopied ? (
                                        <>
                                          <Check className="h-3 w-3" />
                                          <span>Copied Details!</span>
                                        </>
                                      ) : (
                                        <>
                                          <FileText className="h-3 w-3 text-indigo-400" />
                                          <span>Copy with Details</span>
                                        </>
                                      )}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleCopy(project.projectUrl, `proj-${project.id}`)}
                                    className={`rounded p-1 transition-colors ${isUrlCopied
                                        ? "bg-emerald-600/30 text-emerald-400"
                                        : "text-slate-400 hover:bg-slate-700 hover:text-white"
                                      }`}
                                    title="Copy URL"
                                  >
                                    {isUrlCopied ? (
                                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="h-3.5 w-3.5" />
                                    )}
                                  </button>

                                  <a
                                    href={project.projectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                    title="Open link"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
