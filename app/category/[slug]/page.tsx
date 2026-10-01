import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProjectCard, type ProjectCardItem } from "@/components/public/ProjectCard";
import { TechnologyChip } from "@/components/public/TechnologyChip";
import { ArrowLeft, Folder, Layers } from "lucide-react";

import { unstable_cache } from "next/cache";

export const revalidate = 60;

interface CategoryDirectoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    projects: number;
    technologies?: number;
  };
  technologies: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface CategoryTechnologyItem {
  id: string;
  name: string;
  slug: string;
  _count: {
    projects: number;
  };
}

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

const getAllCategoriesData = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            technologies: { where: { status: "ACTIVE" } },
            projects: { where: { status: "ACTIVE" } },
          },
        },
        technologies: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },
  ["categories-directory-data"],
  { revalidate: 60, tags: ["categories", "technologies", "projects"] }
);

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  if (params.slug === "all") {
    return {
      title: "All Categories | Pro-Example Portfolio",
      description: "Browse all portfolio categories and technologies.",
    };
  }

  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!category) {
    return { title: "Category Not Found | Pro-Example" };
  }

  return {
    title: `${category.name} Projects | Pro-Example`,
    description: category.description || `Browse projects in ${category.name}`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // If slug is "all", show the category directory
  if (params.slug === "all") {
    const allCategories = await getAllCategoriesData();

    return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        <Header />
        <main className="flex-1 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold text-slate-900">All Categories</h1>
              <p className="mt-2 text-slate-600">
                Explore our projects grouped by technical discipline and platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allCategories.map((cat: CategoryDirectoryItem) => (
                <div
                  key={cat.id}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-bold text-slate-900">
                        <Link href={`/category/${cat.slug}`} className="hover:text-blue-600">
                          {cat.name}
                        </Link>
                      </h2>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                        {cat._count.projects} projects
                      </span>
                    </div>

                    {cat.description && (
                      <p className="text-sm text-slate-600 mb-4">{cat.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                      {cat.technologies.map((t) => (
                        <TechnologyChip key={t.id} name={t.name} slug={t.slug} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      href={`/category/${cat.slug}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View all {cat.name} projects &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      technologies: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { projects: { where: { status: "ACTIVE" } } },
          },
        },
      },
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

  if (!category || category.status !== "ACTIVE") {
    notFound();
  }

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

          {/* Category Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-8">
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-3">
              <Folder className="h-3.5 w-3.5" />
              <span>Category Portfolio</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              {category.name}
            </h1>

            {category.description && (
              <p className="mt-2 text-base text-slate-600 max-w-3xl">
                {category.description}
              </p>
            )}

            {/* Technologies in this category */}
            {category.technologies.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <span className="block text-xs font-semibold uppercase text-slate-400 mb-2.5">
                  Technologies in this Category
                </span>
                <div className="flex flex-wrap gap-2">
                  {category.technologies.map((tech: CategoryTechnologyItem) => (
                    <TechnologyChip
                      key={tech.id}
                      name={tech.name}
                      slug={tech.slug}
                      count={tech._count.projects}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Projects in this category */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Projects ({category.projects.length})
              </h2>
            </div>

            {category.projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
                <Layers className="mx-auto h-8 w-8 text-slate-400" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">
                  No projects in this category yet
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Projects added under this category will show up here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.projects.map((project: ProjectCardItem) => (
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
