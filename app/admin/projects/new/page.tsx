import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [categories, technologies] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.technology.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, categoryId: true },
    }),
  ]);

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
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Project</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Publish a new portfolio project to your database.
            </p>
          </div>
        </div>

        <ProjectForm
          categories={categories}
          technologies={technologies}
          isEditing={false}
        />
      </div>
    </AdminLayoutClient>
  );
}
