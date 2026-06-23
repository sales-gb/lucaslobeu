import Nav from '@/components/layout/nav'
import Footer from '@/components/layout/footer'
import AnimatedMain from '@/components/layout/animated-main'
import SmoothScroll from '@/components/layout/smooth-scroll'

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
