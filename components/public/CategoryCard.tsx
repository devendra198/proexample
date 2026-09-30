import Link from "next/link";
import { Folder } from "lucide-react";

interface CategoryCardProps {
  name: string;
  slug: string;
  count: number;
}

export function CategoryCard({ name, slug, count }: CategoryCardProps) {
  return (
    <Link
      href={`/category/${slug}`}
      className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-500 hover:shadow-md"
    >
      <div>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {count} {count === 1 ? "Project" : "Projects"}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-end">
        <span className="text-xs font-medium text-slate-400 group-hover:text-blue-600 transition-colors">
          Browse &rarr;
        </span>
      </div>
    </Link>
  );
}
