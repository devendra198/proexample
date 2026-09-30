import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  // Fetch statistics
  const [
    totalCategories,
    totalTechnologies,
    totalProjects,
    activeProjects,
    inactiveProjects,
    featuredProjects,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.technology.count(),
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({ where: { status: { in: ["INACTIVE", "DRAFT"] } } }),
    prisma.project.count({ where: { featured: true } }),
  ]);

  // Fetch categories with technology and project counts
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: {
          technologies: true,
          projects: true,
        },
      },
    },
  });

  // Fetch all technologies
  const technologies = await prisma.technology.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
    },
  });

  // Fetch recent projects
  const recentProjects = await prisma.project.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true, slug: true } },
      technology: { select: { name: true, slug: true } },
    },
  });

  return (
    <AdminLayoutClient adminName={session.name} adminEmail={session.email}>
      <AdminDashboardClient
        stats={{
          totalCategories,
          totalTechnologies,
          totalProjects,
          activeProjects,
          inactiveProjects,
          featuredProjects,
        }}
        categories={categories}
        technologies={technologies}
        recentProjects={recentProjects}
      />
    </AdminLayoutClient>
  );
}
