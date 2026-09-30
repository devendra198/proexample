import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { TechnologyListClient } from "@/components/admin/TechnologyListClient";

export const dynamic = "force-dynamic";

export default async function AdminTechnologiesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [technologies, categories] = await Promise.all([
    prisma.technology.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        category: {
          select: { id: true, name: true },
        },
        _count: {
          select: { projects: true },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <AdminLayoutClient adminName={session.name} adminEmail={session.email}>
      <TechnologyListClient
        initialTechnologies={technologies}
        categories={categories}
      />
    </AdminLayoutClient>
  );
}
