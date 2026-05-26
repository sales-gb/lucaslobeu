import Nav from '@/components/portfolio/Nav'
import Footer from '@/components/portfolio/Footer'
import AnimatedMain from '@/components/portfolio/AnimatedMain'
import SmoothScroll from '@/components/portfolio/SmoothScroll'
import CustomCursor from '@/components/portfolio/CustomCursor'

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SmoothScroll>
      <CustomCursor />
      <Nav />
      <AnimatedMain>{children}</AnimatedMain>
      <Footer />
    </SmoothScroll>
  )
}
