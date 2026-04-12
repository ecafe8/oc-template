import { auth } from "@server/auth/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  redirect(session ? "/account" : "/login");
}
