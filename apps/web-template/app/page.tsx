import { Button } from "@repo/share-ui/components/reui/button";
import { getAuthBaseUrl } from "@repo/share-auth";
import { requireAuth } from "@repo/web-template/lib/auth/require-auth";
import Link from "next/link";

export default async function Home() {
  const session = await requireAuth("/");

  return (
    <main className="min-h-screen bg-linear-to-b from-orange-50 via-background to-white px-6 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <section className="rounded-3xl border border-orange-100 bg-white/90 p-8 shadow-sm shadow-orange-100/60">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-600">Unified Auth Connected</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
            Welcome back, {session.user.name || session.user.email}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground">
            `web-template` is now using the centralized `server-auth` login flow. Your current session is read from
            the shared auth service instead of local app state.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="primary">
              <Link href="/test/ui">Open UI Sandbox</Link>
            </Button>
            <Button asChild variant="outline">
              <a href={`${getAuthBaseUrl()}/account`}>Open Auth Center</a>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/auth/logout?redirect=/">Sign Out</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Current Session</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">User ID</dt>
                <dd className="font-mono">{session.user.id}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd>{session.user.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email Verified</dt>
                <dd>{session.user.emailVerified ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">What Changed</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>`/auth/login` redirects to `server-auth` and keeps the return URL.</li>
              <li>`/api/auth/session` proxies session lookup through the Next app.</li>
              <li>The homepage now requires a valid shared auth session.</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}
