import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthProvider }  from '@/context/AuthContext'
import { Toaster }       from '@/components/ui/Toast'
import './globals.css'

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default:  'Lumi — Your Financial Future, Illuminated',
    template: '%s | Lumi',
  },
  description:
    'AI-powered financial wellness for African youth. Track spending, grow savings, and build wealth — starting today.',
  keywords: ['finance', 'savings', 'Africa', 'MTN', 'Mobile Money', 'budgeting', 'AI'],
  authors:  [{ name: 'Lumi' }],
  creator:  'Lumi',
  openGraph: {
    type:        'website',
    locale:      'en_UG',
    title:       'Lumi — Your Financial Future, Illuminated',
    description: 'AI-powered financial wellness for African youth.',
    siteName:    'Lumi',
    images:      [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Lumi — Your Financial Future, Illuminated',
    description: 'AI-powered financial wellness for African youth.',
    images:      ['/og-image.png'],
  },
  icons: {
    icon:  '/lumi-icon.png',
    apple: '/lumi-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor:    '#0A0F1E',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Sora:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
