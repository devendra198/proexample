import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { getTechBadgeColor } from "@/lib/utils";

export interface ProjectCardItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  featured?: boolean;
  category?: {
    name: string;
    slug: string;
  };
  technology: {
    name: string;
    slug: string;
  };
}

export interface ProjectCardProps {
  project: ProjectCardItem;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const badgeStyle = getTechBadgeColor(project.technology.name);

  return (
    <div
      style={{ contentVisibility: "auto", containIntrinsicSize: "1px 220px" }}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
    >
      <div>
        {/* Technology badge and optional featured star */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <Link
            href={`/technology/${project.technology.slug}`}
            prefetch={true}
            className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-semibold border transition-opacity hover:opacity-80 ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {project.technology.name}
          </Link>

          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
              Featured
            </span>
          )}
        </div>

        {/* Project Name */}
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          <Link href={`/projects/${project.slug}`} prefetch={true}>
            {project.name}
          </Link>
        </h3>

        {/* Short Description */}
        <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">
          {project.shortDescription}
        </p>
      </div>

      {/* Footer Link */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <Link
          href={`/projects/${project.slug}`}
          prefetch={true}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors"
        >
          <span>View Project</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        {project.category && (
          <span className="text-xs text-slate-400">
            {project.category.name}
          </span>
        )}
      </div>
    </div>
  );
}
