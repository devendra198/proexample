import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface EditProjectPageProps {
  params: {
    id: string;
  };
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [project, categories, technologies] = await Promise.all([
    prisma.project.findUnique({
      where: { id: params.id },
      include: {
        links: {
          orderBy: { sortOrder: "asc" },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.technology.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, categoryId: true },
    }),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <AdminLayoutClient adminName={session.name} adminEmail={session.email}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Edit Project: {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Update project details, assign categories, and edit links.
            </p>
          </div>
        </div>

        <ProjectForm
          categories={categories}
          technologies={technologies}
          initialData={{
            id: project.id,
            name: project.name,
            slug: project.slug,
            categoryId: project.categoryId,
            technologyId: project.technologyId,
            shortDescription: project.shortDescription,
            description: project.description,
            projectUrl: project.projectUrl,
            appStoreUrl: project.appStoreUrl,
            playStoreUrl: project.playStoreUrl,
            githubUrl: project.githubUrl,
            imageUrl: project.imageUrl,
            featured: project.featured,
            status: project.status as any,
            sortOrder: project.sortOrder,
            links: project.links.map((l) => ({
              id: l.id,
              label: l.label,
              url: l.url,
            })),
          }}
          isEditing={true}
        />
      </div>
    </AdminLayoutClient>
  );
}
