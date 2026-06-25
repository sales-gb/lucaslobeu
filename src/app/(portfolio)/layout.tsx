import Nav from '@/components/layout/nav'
import Footer from '@/components/layout/footer'
import AnimatedMain from '@/components/layout/animated-main'
import SmoothScroll from '@/components/layout/smooth-scroll'

// Renderização dinâmica (SSR por request) em todo o site público: as páginas e
// o rodapé leem do D1 em runtime, então o conteúdo do CMS aparece sem rebuild.
export const dynamic = 'force-dynamic'

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SmoothScroll>
      <Nav />
      <AnimatedMain>{children}</AnimatedMain>
      <Footer />
    </SmoothScroll>
  )
}
