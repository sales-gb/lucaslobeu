import { getHomeData } from '@/features/home/api/get-home-data'
import { HomeView } from '@/features/home/home-view'

export default async function HomePage() {
  const data = await getHomeData()
  return <HomeView {...data} />
}
