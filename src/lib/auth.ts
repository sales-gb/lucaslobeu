import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

// Google-only auth. The Credentials (email+password) provider was removed:
// it bypassed the ADMIN_ALLOWED_EMAILS whitelist and relied on a password
// seeded in the repo. Access is now restricted exclusively to the Google
// accounts in the whitelist (see the signIn callback in auth.config.ts).
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig)
