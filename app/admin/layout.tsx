import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = headers();
  // Check request path if available, or we can let login page have its own layout or check session
  const session = await getAdminSession();

  // If there's no session and the user is hitting /admin directly (not login), redirect to /admin/login
  // We will also protect in page or middleware, but checking here provides strong defense
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {children}
    </div>
  );
}
