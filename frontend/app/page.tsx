import type { Metadata } from 'next'
import LandingClient from './LandingClient'

export const metadata: Metadata = {
  title: 'Lumi — Your Financial Future, Illuminated',
}

export default function Page() {
  return <LandingClient />
}
