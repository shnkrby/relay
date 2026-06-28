'use client'

import { useState, useRef, useTransition } from 'react'
import { Building2Icon, Settings2Icon, CopyIcon, CheckIcon, RefreshCwIcon, Loader2Icon, CameraIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { updateOrgProfile } from '../_actions/update-org-profile'
import { regenerateJoinCode } from '../_actions/regenerate-join-code'
import { uploadOrgLogo } from '../_actions/upload-org-logo'
import { EntityLogo } from '@/components/relay/entity-logo'

interface ManageOrgDialogProps {
  org: {
    id: string
    name: string
    description: string | null
    slug: string
    join_code: string
    logo_url?: string | null
  }
}

export function ManageOrgDialog({ org }: ManageOrgDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isRegenPending, setIsRegenPending] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(org.logo_url || null)
  const [isUploadingLogo, startLogoTransition] = useTransition()
  const logoInputRef = useRef<HTMLInputElement>(null)

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/join/${org.join_code}`

  async function onSubmit(formData: FormData) {
    setIsPending(true)
    const result = await updateOrgProfile(org.id, org.slug, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Organization updated successfully!')
    setIsOpen(false)
  }

  async function handleRegenerate() {
    setIsRegenPending(true)
    const result = await regenerateJoinCode(org.id, org.slug)
    setIsRegenPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }
    toast.success('Join code regenerated!')
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink)
    setIsCopied(true)
    toast.success('Invite link copied!')
    setTimeout(() => setIsCopied(false), 2000)
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('logo', file)

    startLogoTransition(async () => {
      const result = await uploadOrgLogo(org.id, org.slug, formData)
      if (result.success) {
        toast.success('Organization logo updated!')
        if (result.logoUrl) setLogoPreview(result.logoUrl)
      } else {
        toast.error(result.error || 'Failed to upload logo.')
        setLogoPreview(org.logo_url || null)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Settings2Icon className="mr-2 size-4" />
            Manage Organization
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2Icon className="size-5 text-blue-600" />
            Manage Organization
          </DialogTitle>
          <DialogDescription>
            Update your organization details, logo, and manage your join code.
          </DialogDescription>
        </DialogHeader>

        {/* Logo Upload Section */}
        <div className="flex items-center gap-4 py-4 border-b">
          <div className="relative group">
            {logoPreview ? (
              <div className="size-16 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                <img src={logoPreview} alt={org.name} className="size-full object-cover" />
              </div>
            ) : (
              <EntityLogo name={org.name} logoUrl={null} size="lg" />
            )}
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploadingLogo}
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 group-hover:bg-black/40 transition-colors cursor-pointer"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingLogo ? (
                  <Loader2Icon className="size-5 text-white animate-spin" />
                ) : (
                  <CameraIcon className="size-5 text-white" />
                )}
              </div>
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Organization Logo</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">JPG, PNG, or WebP. Max 2MB.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 text-xs h-7"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploadingLogo}
            >
              {isUploadingLogo ? 'Uploading...' : 'Change Logo'}
            </Button>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleLogoSelect}
            className="hidden"
          />
        </div>

        <form action={onSubmit} className="space-y-6 pt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={org.name} 
                required 
                disabled={isPending} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description / Mission Statement</Label>
              <Textarea 
                id="description" 
                name="description" 
                defaultValue={org.description || ''}
                className="resize-none"
                rows={3}
                disabled={isPending} 
              />
            </div>

            <div className="space-y-2 pt-2 border-t mt-4">
              <Label className="mt-2 block">Invite Link</Label>
              <div className="flex gap-2">
                <Input 
                  readOnly 
                  value={inviteLink} 
                  className="bg-slate-50 font-mono text-sm"
                />
                <Button type="button" variant="secondary" onClick={handleCopy}>
                  {isCopied ? <CheckIcon className="size-4 text-green-600" /> : <CopyIcon className="size-4" />}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleRegenerate}
                  disabled={isRegenPending}
                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  title="Regenerate Code"
                >
                  {isRegenPending ? <Loader2Icon className="size-4 animate-spin" /> : <RefreshCwIcon className="size-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
