import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProjectCinematicView from '@/features/projects/components/project-cinematic-view'
import {
  getProject,
  getProjectDetail,
  getPublishedProjectSlugs,
} from '@/features/projects/api/get-project'

export async function generateStaticParams() {
  return getPublishedProjectSlugs()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return { title: 'Projeto não encontrado' }
  return {
    title: project.metaTitle ?? `${project.title} — Lucas Lobeu`,
    description: project.metaDescription ?? project.summary,
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getProjectDetail(slug)
  if (!data) notFound()

  return (
    <ProjectCinematicView
      project={data.project}
      next={data.next}
      coverImageUrl={data.coverImageUrl}
      nextCoverImageUrl={data.nextCoverImageUrl}
    />
  )
}
