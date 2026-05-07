import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'CHUNITHM Tracker',
  description: 'Track your CHUNITHM scores and B30 rating',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  )
}
