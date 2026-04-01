import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Game of Meditation',
  description: 'Conquer Yourself. One Breath At A Time. Let\'s Play.',
  keywords: ['meditation', 'mindfulness', 'game', 'wellness', 'open source'],
  openGraph: {
    title: 'Game of Meditation',
    description: 'The world\'s first gamified meditation platform for all humanity.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
