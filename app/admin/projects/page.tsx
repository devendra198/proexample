import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { ProjectListClient } from "@/components/admin/ProjectListClient";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [projects, categories, technologies] = await Promise.all([
    prisma.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        technology: { select: { id: true, name: true, slug: true } },
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

  return (
    <AdminLayoutClient adminName={session.name} adminEmail={session.email}>
      <ProjectListClient
        initialProjects={projects}
        categories={categories}
        technologies={technologies}
      />
    </AdminLayoutClient>
  );
}
