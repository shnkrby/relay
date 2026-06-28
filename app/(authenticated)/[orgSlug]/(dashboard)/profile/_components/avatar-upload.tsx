'use client'

import { useRef, useState, useTransition } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CameraIcon, Loader2Icon } from 'lucide-react'
import { uploadAvatar } from '../_actions/upload-avatar'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  initials: string
}

export function AvatarUpload({ currentAvatarUrl, initials }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl)
  const [isPending, startTransition] = useTransition()

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side preview
    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload
    const formData = new FormData()
    formData.append('avatar', file)

    startTransition(async () => {
      const result = await uploadAvatar(formData)
      if (result.success) {
        toast.success('Avatar updated successfully!')
        if (result.avatarUrl) {
          setPreview(result.avatarUrl)
        }
      } else {
        toast.error(result.error || 'Failed to upload avatar.')
        setPreview(currentAvatarUrl) // Revert preview
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className="size-28 border-4 border-white dark:border-slate-800 shadow-lg">
          {preview && <AvatarImage src={preview} alt="Profile" />}
          <AvatarFallback className="text-3xl font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {initials}
          </AvatarFallback>
        </Avatar>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-colors cursor-pointer"
        >
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {isPending ? (
              <Loader2Icon className="size-6 text-white animate-spin" />
            ) : (
              <CameraIcon className="size-6 text-white" />
            )}
          </div>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        className="text-xs"
      >
        {isPending ? (
          <>
            <Loader2Icon className="size-3 animate-spin mr-1" />
            Uploading...
          </>
        ) : (
          'Change Photo'
        )}
      </Button>
    </div>
  )
}
