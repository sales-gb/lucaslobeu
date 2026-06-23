import type { Metadata } from 'next'
import { getJournalEntries } from '@/features/journal/api/get-journal'
import JournalView from '@/features/journal/components/journal-view'

export const metadata: Metadata = {
  title: 'Diário — Lucas Lobeu',
  description: 'Notas, reflexões e bastidores de processo.',
}

export default async function JournalPage() {
  const entries = await getJournalEntries()
  return <JournalView entries={entries} />
}
