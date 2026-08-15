import Link from "next/link";
import {
  ShieldCheck,
  ClipboardCheck,
  BadgeCheck,
  Search,
  ArrowRight,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: ClipboardCheck,
    title: "Track your clearance",
    description:
      "See every clearance stage — Department, Library, Bursary, Hostel and more — all in one place, updated in real time.",
  },
  {
    icon: Lock,
    title: "Secure institutional workflow",
    description:
      "Each stage is signed off by the responsible office. Students and staff log in with secure, role-based accounts.",
  },
  {
    icon: BadgeCheck,
    title: "Verified graduates",
    description:
      "Once all stages are cleared, the student is marked verified and can be looked up by matriculation number.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-zinc-50">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <ShieldCheck className="h-4 w-4" />
            </span>
            ClearPath
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center sm:py-28">
            <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
              <BadgeCheck className="h-3.5 w-3.5" />
              Student Clearance &amp; Institutional Verification
            </p>
            <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
              Clear your way to graduation, digitally
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
              A single platform where students track their clearance stages, departmental offices
              sign off each step, and institutions verify the credentials of graduates.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                Create student account
                <ArrowRight className="h-4 w-4" />
              </Link>
              {/* <Link
                href="/verify"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-zinc-300 px-6 text-base font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                <Search className="h-4 w-4" />
                Verify a graduate
              </Link> */}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {feature.title}
                </h2>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 py-6 dark:border-zinc-800">
        <div className="mx-auto w-full max-w-6xl px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          ClearPath — Student Clearance and Institutional Verification System.
        </div>
      </footer>
    </div>
  );
}
