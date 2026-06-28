'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { PlusIcon, Loader2Icon } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createCommittee } from '../_actions/create-committee'

interface Member {
  id: string
  name: string
  role?: string
}

interface CreateCommitteeDialogProps {
  orgId: string
  orgSlug: string
  orgMembers?: Member[]
  currentUserId?: string
}

export function CreateCommitteeDialog({ orgId, orgSlug, orgMembers = [], currentUserId }: CreateCommitteeDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string>('')
  const [selectedExecutiveId, setSelectedExecutiveId] = useState<string>(currentUserId || '')
  const [isNoLimit, setIsNoLimit] = useState(true)
  const router = useRouter()

  async function onSubmit(formData: FormData) {
    if (!selectedLeadId) {
      toast.error('Please select a committee head.')
      return
    }

    setIsPending(true)
    formData.set('leadId', selectedLeadId)
    formData.set('executiveId', selectedExecutiveId)

    const result = await createCommittee(orgSlug, orgId, null, formData)
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Committee created successfully!')
    setOpen(false)
    setSelectedLeadId('')
    setSelectedExecutiveId(currentUserId || '')
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" />
        }
      >
        <PlusIcon className="mr-2 size-4" />
        Create Committee
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Committee</DialogTitle>
          <DialogDescription>
            You can assign an <strong className="text-foreground">Executive-in-Charge</strong> to oversee this committee, and appoint a Committee Lead to handle day-to-day operations.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Committee Name</Label>
              <Input id="name" name="name" placeholder="e.g., Marketing, Development" required disabled={isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Committee Purpose / Description (Optional)</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Briefly describe what this committee is responsible for..." 
                disabled={isPending} 
                className="resize-none"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="executiveId">Executive-in-Charge</Label>
              <Select 
                name="executiveId" 
                disabled={isPending} 
                required
                value={selectedExecutiveId}
                onValueChange={(val: string | null) => setSelectedExecutiveId(val || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign an executive...">
                    {selectedExecutiveId 
                      ? orgMembers.find(m => m.id === selectedExecutiveId)?.name 
                      : "Assign an executive..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {orgMembers
                    .filter(m => m.role === 'admin' || m.role === 'owner')
                    .map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leadId">Committee Lead (Day-to-day Manager)</Label>
              <Select 
                name="leadId" 
                disabled={isPending} 
                required
                value={selectedLeadId}
                onValueChange={(val: string | null) => setSelectedLeadId(val || '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Assign a lead...">
                    {selectedLeadId 
                      ? orgMembers.find(m => m.id === selectedLeadId)?.name 
                      : "Assign a lead..."}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {orgMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="memberLimit">Member Limit</Label>
              <Input
                id="memberLimit"
                name="memberLimit"
                type="number"
                min="8"
                defaultValue="8"
                disabled={isNoLimit || isPending}
              />
              <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 mt-2">
                <input 
                  type="checkbox" 
                  checked={isNoLimit} 
                  onChange={(e) => setIsNoLimit(e.target.checked)}
                  disabled={isPending}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                />
                No Limit
              </label>
              {!isNoLimit && <p className="text-xs text-slate-500">Minimum 8 members including head.</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !selectedLeadId} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Committee'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
