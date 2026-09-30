"use client";

import { useState, useMemo } from "react";
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
  { id: "dev-2", name: "Krishan", url: "https://krishanofficial.in/", role: "Frontend & UI Developer" },
  { id: "dev-3", name: "Kahan Singh", url: "https://kahansingh.in/", role: "Full-Stack & CMS Developer" },
  { id: "dev-4", name: "Adarsh", url: "https://adarshofficial.in/", role: "Web & Mobile Developer" },
  { id: "dev-5", name: "Devendra Singh", url: "https://devendrasingh.co.in/", role: "Software Engineer" },
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

export function ProposalShowcase({
  categories,
  developerPortfolios = DEVELOPER_PORTFOLIOS,
}: ProposalShowcaseProps) {
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [includeNames, setIncludeNames] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

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

  // Filter project categories by search (name, website URL, iOS App URL, Android App URL, tech, category)
  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    const qClean = normalizeUrlString(q);

    return categories
      .map((cat) => {
        if (selectedFilter !== "all" && selectedFilter !== "all-projects" && cat.slug !== selectedFilter) {
          return null;
        }

        const filteredTechs = cat.technologies
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
  }, [categories, search, selectedFilter]);

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
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-500 mr-1">View:</span>
            <button
              onClick={() => setSelectedFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                selectedFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Sections
            </button>
            <button
              onClick={() => setSelectedFilter("portfolios")}
              className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                selectedFilter === "portfolios"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
              }`}
            >
              Developer Portfolios (5)
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedFilter(c.slug)}
                className={`rounded-lg px-2.5 py-1 font-medium transition-all ${
                  selectedFilter === c.slug
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Proposal Format & Details Toggle Options */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-slate-600">
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all border ${
                showDetails
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-sm"
                  : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
              }`}
              title={showDetails ? "Hide all 'Copy with Details' buttons" : "Show all 'Copy with Details' buttons"}
            >
              {showDetails ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Hide Details Buttons</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  <span>Show Details Buttons</span>
                </>
              )}
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
      </div>

      {/* Full-Width Landscape Proposal Sheets */}
      <div className="space-y-8">
        {/* SEPARATE DEVELOPER PORTFOLIOS SECTION */}
        {showDevSection && filteredDevelopers.length > 0 && (
          <div className="relative rounded-2xl bg-[#202124] text-slate-100 p-6 sm:p-7 shadow-lg border border-slate-800 transition-all hover:border-slate-700 font-sans">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5">
              <div>
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
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    copiedId === "devs-all"
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
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          isCopied
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

        {/* CATEGORY WORK SECTIONS (Web Design, Web Development, etc.) */}
        {showProjectSections &&
          filteredCategories.map((category) => {
            const categoryUrlsOnlyText = generateCategoryText(category, false);
            const categoryDetailsText = generateCategoryText(category, true);
            const isCategoryCopied = copiedId === `cat-${category.id}`;
            const isCategoryDetailsCopied = copiedId === `cat-details-${category.id}`;

            return (
              <div
                key={category.id}
                className="relative rounded-2xl bg-[#202124] text-slate-100 p-6 sm:p-7 shadow-lg border border-slate-800 transition-all hover:border-slate-700 font-sans"
              >
                {/* Note Top Bar */}
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800/80 pb-4 mb-5">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                      {category.name}
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      Ready to copy directly into proposals
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleCopy(categoryUrlsOnlyText, `cat-${category.id}`)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                        isCategoryCopied
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
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                          isCategoryDetailsCopied
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
                              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                                isTechCopied
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
                                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all ${
                                  isTechDetailsCopied
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
                                      {showDetails && hasAppDescription && (
                                        <button
                                          onClick={() => handleCopy(appDetailsText, `proj-app-details-${project.id}`)}
                                          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                                            isAppDetailsCopied
                                              ? "bg-emerald-600 text-white"
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
                                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                                          isAppCopied
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

                            // Regular Web Projects: Do NOT display bulky details, display clean URL line only!
                            const hasDescription = Boolean(
                              project.description &&
                              project.description.trim() !== "" &&
                              project.description.trim() !== project.name.trim()
                            );
                            const projectDetailSnippet = `${idx + 1}. ${project.name}\n${project.description?.trim() || ""}\nWebsite: ${project.projectUrl}`;
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
                                  {showDetails && hasDescription && (
                                    <button
                                      onClick={() => handleCopy(projectDetailSnippet, `proj-detail-${project.id}`)}
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                                        isDetailCopied
                                          ? "bg-emerald-600 text-white"
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
                                    className={`rounded p-1 transition-colors ${
                                      isUrlCopied
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
