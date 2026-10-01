export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
      {/* Top indeterminate sleek progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-100 overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-sky-400 animate-pulse" />
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
        <span className="text-xs font-medium text-slate-400 animate-pulse">Loading...</span>
      </div>
    </div>
  );
}
