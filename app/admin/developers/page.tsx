import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { DeveloperPortfolioListClient } from "@/components/admin/DeveloperPortfolioListClient";

export const dynamic = "force-dynamic";

export default async function AdminDevelopersPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const developers = await prisma.developerPortfolio.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <AdminLayoutClient adminName={session.name} adminEmail={session.email}>
      <DeveloperPortfolioListClient initialDevelopers={developers} />
    </AdminLayoutClient>
  );
}
