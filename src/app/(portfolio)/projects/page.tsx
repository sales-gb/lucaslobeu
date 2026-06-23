import type { Metadata } from 'next'
import { getProjectsPageData } from '@/features/projects/api/get-projects'
import ProjectsView from '@/features/projects/components/projects-view'

export const metadata: Metadata = {
  title: 'Projetos — Lucas Lobeu',
  description: 'Portfólio de direção audiovisual e fotografia.',
}

export default async function ProjectsPage() {
  const { projects, heroSub, manifestoText, manifestoImageUrl } =
    await getProjectsPageData()

  return (
    <ProjectsView
      projects={projects}
      heroSub={heroSub}
      manifestoText={manifestoText}
      manifestoImageUrl={manifestoImageUrl}
    />
  )
}
