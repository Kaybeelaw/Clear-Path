import Link from "next/link";
import { ShieldCheck, LayoutDashboard, ClipboardList, UserCog, LogOut } from "lucide-react";
import { getSession } from "@/lib/session";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/cn";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  const links = [
    { href: "/dashboard", label: "My clearance", icon: LayoutDashboard, roles: ["STUDENT"] as const },
    { href: "/officer", label: "My desk", icon: ClipboardList, roles: ["OFFICER"] as const },
    { href: "/admin", label: "Administration", icon: UserCog, roles: ["ADMIN"] as const },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            ClearPath
          </Link>

          <nav className="flex items-center gap-1">
            {links
              .filter((link) => session && link.roles.includes(session.role as never))
              .map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors",
                    "hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-3">
            {session ? (
              <span className="hidden text-sm text-zinc-500 sm:block dark:text-zinc-400">
                {session.email}
              </span>
            ) : null}
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-zinc-50 dark:bg-zinc-950">{children}</main>
    </div>
  );
}
