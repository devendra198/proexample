export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8 text-sm text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Pro-Example. All rights reserved.</p>
          <p>
            Created by{" "}
            <a
              href="https://devendrasingh.co.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-700 hover:text-indigo-600 transition-colors underline-offset-2 hover:underline"
            >
              Devendra
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
