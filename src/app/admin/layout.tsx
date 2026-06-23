import '@/styles/portfolio.css'
import '@/styles/admin.css'

// Auth protection is handled by middleware.ts — no redirect needed here.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
