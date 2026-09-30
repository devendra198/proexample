import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProjectsExplorer } from "@/components/public/ProjectsExplorer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Projects | Pro-Example Portfolio",
  description:
    "Browse through our complete collection of web applications, mobile apps, CMS portals, and developer projects.",
};

interface ProjectsPageProps {
  searchParams: {
    search?: string;
    category?: string;
    tech?: string;
    featured?: string;
  };
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  // Fetch active categories
  const categories = await prisma.category.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // Fetch active technologies
  const technologies = await prisma.technology.findMany({
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, categoryId: true },
  });

  // Fetch all active projects
  const projects = await prisma.project.findMany({
    where: { status: "ACTIVE" },
    orderBy: [
      { featured: "desc" },
      { sortOrder: "asc" },
      { createdAt: "desc" },
    ],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      technology: { select: { id: true, name: true, slug: true } },
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header />

      <main className="flex-1 py-10 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              All Projects
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Filter by category, technology, or search across our entire portfolio.
            </p>
          </div>

          <ProjectsExplorer
            initialProjects={projects}
            categories={categories}
            technologies={technologies}
            initialSearch={searchParams.search}
            initialCategory={searchParams.category}
            initialTechnology={searchParams.tech}
            initialFeatured={searchParams.featured === "true"}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
