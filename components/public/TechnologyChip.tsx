import Link from "next/link";

interface TechnologyChipProps {
  name: string;
  slug: string;
  count?: number;
  isSelected?: boolean;
}

export function TechnologyChip({ name, slug, count, isSelected }: TechnologyChipProps) {
  return (
    <Link
      href={`/technology/${slug}`}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all ${
        isSelected
          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span>{name}</span>
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.2 text-[10px] ${
            isSelected ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
