import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Code, Server, Smartphone, Cpu, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              About Pro-Example
            </h1>
            <p className="mt-3 text-base text-slate-600">
              A minimalist, high-speed portfolio engine and content management platform built for modern developers and agencies.
            </p>
          </div>

          <div className="space-y-12">
            <div className="rounded-2xl border border-slate-200 p-8 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Architecture & Tech Stack</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Pro-Example is engineered with modern full-stack best practices, featuring server-side rendering, instant database queries, and a clean developer-centric UI without bloat.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <Code className="h-4 w-4 text-blue-600" />
                    <span>Next.js App Router</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    TypeScript, React Server Components, dynamic streaming and SEO optimization.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <Server className="h-4 w-4 text-emerald-600" />
                    <span>Neon PostgreSQL + Prisma</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Serverless relational PostgreSQL database with strong schema safety, migrations, and relationship enforcement.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <span>Admin Authentication</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Secure password hashing with bcrypt, JWT session tokens stored in httpOnly cookies.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                    <Cpu className="h-4 w-4 text-amber-600" />
                    <span>Dynamic Categorization</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Hierarchical Category &rarr; Technology &rarr; Project data structure with full CRUD in admin.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors"
              >
                Browse Portfolio Projects
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
