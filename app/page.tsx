import { prisma } from "@/lib/prisma";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProposalShowcase } from "@/components/public/ProposalShowcase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch active categories and developer portfolios in parallel
  const [categories, developerPortfolios] = await Promise.all([
    prisma.category.findMany({
      where: { status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
      include: {
        technologies: {
          where: { status: "ACTIVE" },
          orderBy: { sortOrder: "asc" },
          include: {
            projects: {
              where: { status: "ACTIVE" },
              orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
              select: {
                id: true,
                name: true,
                shortDescription: true,
                description: true,
                projectUrl: true,
                appStoreUrl: true,
                playStoreUrl: true,
                featured: true,
              },
            },
          },
        },
      },
    }),
    prisma.developerPortfolio.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        url: true,
        role: true,
      },
    }),
  ]);

  // Filter out technologies that have 0 projects for cleaner proposal view
  const categoriesWithProjects = categories
    .map((cat) => ({
      ...cat,
      technologies: cat.technologies.filter((t) => t.projects.length > 0),
    }))
    .filter((cat) => cat.technologies.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                Portfolio Proposal Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Fast, 1-click copy links and work samples directly into your client proposals.
              </p>
            </div>
          </div>

          <ProposalShowcase
            categories={categoriesWithProjects}
            developerPortfolios={developerPortfolios.map(d => ({ ...d, role: d.role || "Developer" }))}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
