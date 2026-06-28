'use client'

import { useState } from 'react'
import { Building2Icon, Settings2Icon, CopyIcon, CheckIcon, RefreshCwIcon, Loader2Icon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { updateOrgProfile } from '../_actions/update-org-profile'
import { regenerateJoinCode } from '../_actions/regenerate-join-code'

interface ManageOrgDialogProps {
  org: {
    id: string
    name: string
    description: string | null
    slug: string
    join_code: string
  }
}

export function ManageOrgDialog({ org }: ManageOrgDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isRegenPending, setIsRegenPending] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          <Settings2Icon className="mr-2 size-4" />
          Manage Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2Icon className="size-5 text-blue-600" />
            Manage Organization
          </DialogTitle>
          <DialogDescription>
            Update your organization details and manage your join code.
          </DialogDescription>
        </DialogHeader>

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
