import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminLayoutClient adminName={session.name} adminEmail={session.email}>
      <AdminSettingsClient adminEmail={session.email} adminName={session.name} />
    </AdminLayoutClient>
  );
}
