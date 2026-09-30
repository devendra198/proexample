import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProjectCard, type ProjectCardItem } from "@/components/public/ProjectCard";
import { getTechBadgeColor } from "@/lib/utils";
import { ArrowLeft, Cpu, Layers } from "lucide-react";

export const dynamic = "force-dynamic";

interface TechPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: TechPageProps): Promise<Metadata> {
  const tech = await prisma.technology.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!tech) {
    return { title: "Technology Not Found | Pro-Example" };
  }

  return {
    title: `${tech.name} Projects | Pro-Example Portfolio`,
    description:
      tech.description || `Browse web and mobile projects built with ${tech.name}.`,
  };
}

export default async function TechnologyPage({ params }: TechPageProps) {
  const tech = await prisma.technology.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      projects: {
        where: { status: "ACTIVE" },
        orderBy: [
          { featured: "desc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
        include: {
          category: { select: { name: true, slug: true } },
          technology: { select: { name: true, slug: true } },
        },
      },
    },
  });

  if (!tech || tech.status !== "ACTIVE") {
    notFound();
  }

  const badgeStyle = getTechBadgeColor(tech.name);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to all projects</span>
            </Link>
          </div>

          {/* Technology Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`inline-block rounded-md px-3 py-1 text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
              >
                <Cpu className="inline-block h-3.5 w-3.5 mr-1" />
                Technology Focus
              </span>

              <Link
                href={`/category/${tech.category.slug}`}
                className="inline-block rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Part of {tech.category.name}
              </Link>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {tech.name} Projects
            </h1>

            {tech.description && (
              <p className="mt-2 text-base text-slate-600 max-w-3xl">
                {tech.description}
              </p>
            )}
          </div>

          {/* Projects List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Projects built with {tech.name} ({tech.projects.length})
              </h2>
            </div>

            {tech.projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Layers className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  No projects with {tech.name} yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Projects tagged with {tech.name} will show up here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tech.projects.map((project: ProjectCardItem) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
