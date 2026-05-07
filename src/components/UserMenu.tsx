'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  username: string
  email: string
  avatarUrl: string | null
}

export default function UserMenu({ userId, username, email, avatarUrl }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [currentAvatar, setCurrentAvatar] = useState(avatarUrl)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const initials = username?.[0]?.toUpperCase() ?? '?'

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please upload a JPEG, PNG, WebP, or GIF image.')
      e.target.value = ''
      return
    }

    setUploading(true)
    setUploadError('')

    const supabase = createClient()

    // Use user ID as the path (no extension) so re-uploads overwrite the same file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(userId, file, { upsert: true, contentType: file.type })

    if (uploadError) {
      setUploadError(uploadError.message)
      toast.error('Upload failed: ' + uploadError.message)
      setUploading(false)
      e.target.value = ''
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(userId)
    // Append version param so the browser doesn't serve the old cached image
    const freshUrl = `${data.publicUrl}?v=${Date.now()}`

    await supabase.from('profiles').update({ avatar_url: freshUrl }).eq('id', userId)

    setCurrentAvatar(freshUrl)
    setUploading(false)
    e.target.value = ''
    toast.success('Profile picture updated!')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-9 h-9 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-violet-500"
        aria-label="User menu"
      >
        {currentAvatar
          ? <img src={currentAvatar} alt={username} className="w-full h-full object-cover" />
          : (
            <div
              className="w-full h-full flex items-center justify-center text-white text-sm font-bold select-none"
              style={{ background: '#7c3aed' }}
            >
              {initials}
            </div>
          )
        }
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-2xl z-30 flex flex-col overflow-hidden"
            style={{ background: '#18182a', border: '1px solid #2a2a40' }}
          >
            {/* User info + avatar */}
            <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid #2a2a40' }}>
              <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
                {currentAvatar
                  ? <img src={currentAvatar} alt={username} className="w-full h-full object-cover" />
                  : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold select-none"
                      style={{ background: '#7c3aed' }}
                    >
                      {initials}
                    </div>
                  )
                }
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate">{username}</p>
                <p className="text-slate-400 text-xs truncate">{email}</p>
              </div>
            </div>

            {/* Upload avatar */}
            <div className="px-4 py-3" style={{ borderBottom: '1px solid #2a2a40' }}>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={() => { setUploadError(''); fileRef.current?.click() }}
                disabled={uploading}
                className="w-full text-left text-sm text-slate-300 hover:text-white transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading…' : '📷  Change profile picture'}
              </button>
              {uploadError && (
                <p className="mt-1.5 text-xs text-red-400">{uploadError}</p>
              )}
            </div>

            {/* Sign out */}
            <div className="px-4 py-3">
              <button
                onClick={handleSignOut}
                className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
