import type { Metadata } from "next";

import { AdminSignIn } from "@/components/admin/AdminSignIn";
import { Dashboard } from "@/components/admin/Dashboard";
import { isAdminAuthenticated } from "@/lib/dashboard/auth";
import { getDashboardData } from "@/lib/dashboard/data";
import { isAdminConfigured } from "@/lib/env";

/**
 * Internal dashboard. Not linked anywhere, not in `lib/routes.ts` (so not
 * in the nav, footer, or sitemap), `noindex` here and via `X-Robots-Tag`
 * in the proxy. Data is only read after the session cookie verifies.
 * `?exp=<id>` (repeatable) and `?from=` / `?to=` (YYYY-MM-DD, UTC) scope
 * every panel.
 */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  if (!(await isAdminAuthenticated())) {
    return <AdminSignIn configured={isAdminConfigured} />;
  }
  return <Dashboard data={await getDashboardData(await searchParams)} />;
}
