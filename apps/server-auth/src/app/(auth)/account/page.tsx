import { auth } from "@server/auth/lib/auth";
import { headers } from "next/headers";

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <main className="w-full max-w-2xl rounded-xl border bg-background p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Account</h1>
      <p className="mt-2 text-sm text-muted-foreground">This page confirms the current session is active.</p>
      <dl className="mt-6 space-y-4">
        <div>
          <dt className="text-sm font-medium text-muted-foreground">User ID</dt>
          <dd className="mt-1 font-mono text-sm">{session?.user.id}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Name</dt>
          <dd className="mt-1 text-sm">{session?.user.name}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-muted-foreground">Email</dt>
          <dd className="mt-1 text-sm">{session?.user.email}</dd>
        </div>
      </dl>
    </main>
  );
}
