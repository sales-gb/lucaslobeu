import Nav from '@/components/portfolio/Nav'
import Footer from '@/components/portfolio/Footer'
import AnimatedMain from '@/components/portfolio/AnimatedMain'
import SmoothScroll from '@/components/portfolio/SmoothScroll'

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
