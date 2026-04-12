import { env } from "@server/auth/config/env";
import { CONST } from "@server/auth/const";
import { betterAuth } from "better-auth";
import { bearer, openAPI, organization } from "better-auth/plugins";
import { Pool } from "pg";

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

const isProduction = env.NODE_ENV === "production";
const enableCrossSubDomainCookies = env.BETTER_AUTH_CROSS_SUBDOMAIN.length > 0 && env.BETTER_AUTH_CROSS_SUBDOMAIN !== "localhost";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  database: new Pool({
    connectionString: env.DATABASE_URL,
  }),
  trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS,
  advanced: {
    useSecureCookies: isProduction,
    cookies: {
      session_token: {
        name: CONST.cookiesKeyToken,
        attributes: {
          sameSite: "lax",
          secure: isProduction,
          httpOnly: true,
        },
      },
    },
    crossSubDomainCookies: {
      enabled: enableCrossSubDomainCookies,
      domain: env.BETTER_AUTH_CROSS_SUBDOMAIN,
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    sendResetPassword: async ({ user, url }) => {
      // TODO: replace with real email service (e.g. Resend) in production
      console.log(`[sendResetPassword] Reset link for ${user.email}: ${url}`);
    },
  },
  socialProviders: {
  },
  plugins: [openAPI(), bearer(), organization()],
});
