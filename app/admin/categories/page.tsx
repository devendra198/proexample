import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { CategoryListClient } from "@/components/admin/CategoryListClient";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          technologies: true,
          projects: true,
        },
      },
    },
  });

  return (
    <AdminLayoutClient adminName={session.name} adminEmail={session.email}>
      <CategoryListClient initialCategories={categories} />
    </AdminLayoutClient>
  );
}
