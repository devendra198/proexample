import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { getTechBadgeColor, formatUrl } from "@/lib/utils";
import {
  ExternalLink,
  Github,
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Smartphone,
  Globe,
  Share2,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ProjectDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: {
      technology: true,
      category: true,
    },
  });

  if (!project) {
    return {
      title: "Project Not Found | Pro-Example",
    };
  }

  return {
    title: `${project.name} | ${project.technology.name} Project`,
    description: project.shortDescription,
    openGraph: {
      title: `${project.name} | ${project.technology.name} Project`,
      description: project.shortDescription,
    },
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = await prisma.project.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      technology: true,
      links: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!project || project.status !== "ACTIVE") {
    notFound();
  }

  const badgeStyle = getTechBadgeColor(project.technology.name);

  // Collect all available action buttons
  const hasAppStore = Boolean(project.appStoreUrl?.trim());
  const hasPlayStore = Boolean(project.playStoreUrl?.trim());
  const hasGithub = Boolean(project.githubUrl?.trim());
  const hasWebsite = Boolean(project.projectUrl?.trim());
  const hasAdditionalLinks = project.links && project.links.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all projects</span>
            </Link>
          </div>

          {/* Main Card */}
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* Top Header */}
            <div className="border-b border-slate-100 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Link
                  href={`/technology/${project.technology.slug}`}
                  className={`inline-block rounded-md px-3 py-1 text-xs font-semibold border transition-opacity hover:opacity-80 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                >
                  {project.technology.name}
                </Link>

                <Link
                  href={`/category/${project.category.slug}`}
                  className="inline-block rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  {project.category.name}
                </Link>

                {project.featured && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 border border-amber-200">
                    <Sparkles className="h-3 w-3 fill-amber-500 text-amber-500" />
                    Featured Project
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                {project.name}
              </h1>

              <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
                {project.shortDescription}
              </p>
            </div>

            {/* Action Buttons Bar */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 sm:px-8 py-4">
              <div className="flex flex-wrap items-center gap-3">
                {hasWebsite && (
                  <a
                    href={formatUrl(project.projectUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Visit Website</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </a>
                )}

                {hasAppStore && (
                  <a
                    href={formatUrl(project.appStoreUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>View App Store</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </a>
                )}

                {hasPlayStore && (
                  <a
                    href={formatUrl(project.playStoreUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    <Smartphone className="h-4 w-4" />
                    <span>View Google Play</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </a>
                )}

                {hasGithub && (
                  <a
                    href={formatUrl(project.githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <Github className="h-4 w-4" />
                    <span>View GitHub</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                )}

                {/* Additional Links repeater buttons */}
                {hasAdditionalLinks &&
                  project.links.map((link) => (
                    <a
                      key={link.id}
                      href={formatUrl(link.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      <Share2 className="h-4 w-4 text-slate-500" />
                      <span>{link.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                    </a>
                  ))}
              </div>
            </div>

            {/* Optional Image */}
            {project.imageUrl && (
              <div className="border-b border-slate-100 p-6 sm:p-8 bg-slate-50/20">
                <img
                  src={project.imageUrl}
                  alt={project.name}
                  loading="lazy"
                  decoding="async"
                  className="rounded-xl border border-slate-200 w-full object-cover max-h-96"
                />
              </div>
            )}

            {/* Full Description & Specs */}
            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3">About this Project</h2>
                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line leading-relaxed">
                  {project.description}
                </div>
              </div>

              {/* Meta details */}
              <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500">
                <div>
                  <span className="block font-semibold uppercase text-slate-400">Category</span>
                  <Link
                    href={`/category/${project.category.slug}`}
                    className="mt-0.5 text-slate-800 hover:text-blue-600 font-medium"
                  >
                    {project.category.name}
                  </Link>
                </div>
                <div>
                  <span className="block font-semibold uppercase text-slate-400">Technology</span>
                  <Link
                    href={`/technology/${project.technology.slug}`}
                    className="mt-0.5 text-slate-800 hover:text-blue-600 font-medium"
                  >
                    {project.technology.name}
                  </Link>
                </div>
                <div>
                  <span className="block font-semibold uppercase text-slate-400">Added to Portfolio</span>
                  <span className="mt-0.5 text-slate-800 font-medium block">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
