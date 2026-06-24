import { HeroSection } from "@/features/home/components/hero-section";
import { AboutSection } from "@/features/home/components/about-section";
import { StatsSection } from "@/features/home/components/stats-section";
import { ShowcaseIntroSection } from "@/features/home/components/showcase-intro-section";
import { SelectedWorksSection } from "@/features/home/components/selected-works-section";
import { TestimonialsSection } from "@/features/home/components/testimonials-section";
import { ClientsSection } from "@/features/home/components/clients-section";
import { FaqSection } from "@/features/home/components/faq-section";
import { MarqueeSection } from "@/features/home/components/marquee-section";
import { CtaSection } from "@/features/home/components/cta-section";
import {
  DEFAULT_HERO_ROLES,
  DEFAULT_HERO_DESC,
  DEFAULT_ABOUT_STMT,
  DEFAULT_ABOUT_FOOT,
  DEFAULT_CTA_HEAD,
  DEFAULT_CTA_SUB,
} from "@/features/home/data/fallbacks";
import type { HomeData } from "@/features/home/api/get-home-data";

/**
 * Composição da home. Server Component "burro": apenas ordena as seções e
 * aplica os textos default. Toda a busca de dados vive em getHomeData(); toda
 * a animação vive nas seções client.
 */
export function HomeView({
  projects,
  heroRoles,
  heroDescription,
  aboutStatement,
  aboutFooterHeadline,
  ctaHeadline,
  ctaSub,
  stats,
  testimonials,
  faqItems,
  clients,
  showcaseImageUrl,
  aboutPortraitUrl,
  aboutFooterImageUrl,
}: HomeData) {
  return (
    <>
      <HeroSection
        roles={heroRoles || DEFAULT_HERO_ROLES}
        description={heroDescription || DEFAULT_HERO_DESC}
      />
      <AboutSection
        statement={aboutStatement || DEFAULT_ABOUT_STMT}
        footerHeadline={aboutFooterHeadline || DEFAULT_ABOUT_FOOT}
        portraitUrl={aboutPortraitUrl || undefined}
        footerImageUrl={aboutFooterImageUrl || undefined}
      />
      <StatsSection stats={stats} />
      <ShowcaseIntroSection imageUrl={showcaseImageUrl || undefined} />
      <SelectedWorksSection projects={projects} />
      <TestimonialsSection testimonials={testimonials} />
      <ClientsSection clients={clients} />
      <FaqSection faqItems={faqItems} />
      <MarqueeSection />
      <CtaSection
        headline={ctaHeadline || DEFAULT_CTA_HEAD}
        sub={ctaSub || DEFAULT_CTA_SUB}
      />
    </>
  );
}
