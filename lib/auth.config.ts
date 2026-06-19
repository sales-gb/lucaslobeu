import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Only these two accounts may sign in via Google. The env var lets you
// override the list in production without a code change; if unset we fall
// back to the two known administrators.
const DEFAULT_ALLOWED_EMAILS = [
  "gabrielsales081@gmail.com",
  "lucaslobeu@gmail.com",
];

const ALLOWED_EMAILS = (() => {
  const fromEnv = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return fromEnv.length > 0 ? fromEnv : DEFAULT_ALLOWED_EMAILS;
})();

// Edge-safe config — no Node.js modules (no DB, no bcrypt).
// Used by middleware.ts for JWT validation in the Edge Runtime.
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = (user.email ?? "").toLowerCase();
        if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email)) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
};
