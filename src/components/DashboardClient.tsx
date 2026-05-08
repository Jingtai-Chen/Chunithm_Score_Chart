'use client'

import { useRef, useState } from 'react'
import UserMenu from './UserMenu'
import B30Grid, { type B30GridHandle } from './B30Grid'

interface Props {
  userId: string
  username: string
  email: string
  avatarUrl: string | null
}

export default function DashboardClient({ userId, username, email, avatarUrl }: Props) {
  const gridRef = useRef<B30GridHandle>(null)
  const [exporting, setExporting] = useState(false)

  return (
    <>
      <header
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
        style={{ background: '#0f0f1a', borderBottom: '1px solid #2a2a40' }}
      >
        <span className="font-bold text-white text-lg tracking-wide">CHUNITHM Tracker</span>
        <UserMenu
          userId={userId}
          username={username}
          email={email}
          avatarUrl={avatarUrl}
          onExport={() => gridRef.current?.triggerExport()}
          exporting={exporting}
        />
      </header>

      <main>
        <B30Grid
          ref={gridRef}
          username={username}
          onExportingChange={setExporting}
        />
      </main>
    </>
  )
}
