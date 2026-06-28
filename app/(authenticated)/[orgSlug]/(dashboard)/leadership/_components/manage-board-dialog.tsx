'use client'

import * as React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2Icon, PlusIcon, Trash2Icon, Settings2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateBoard } from '../_actions/update-board'
import { useRouter } from 'next/navigation'

interface Member {
  id: string
  name: string
  email: string
  role: string
  executive_title?: string
}

interface ManageBoardDialogProps {
  orgId: string
  orgSlug: string
  members: Member[]
  currentUserId: string
  vacantRoles: string[]
}

export function ManageBoardDialog({ orgId, orgSlug, members, currentUserId, vacantRoles }: ManageBoardDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  
  // Pre-populate with existing executives + vacant roles
  const initialExecs = members
    .filter(m => m.role === 'owner' || m.role === 'admin')
    .map(m => ({ profileId: m.id, title: m.executive_title || 'Executive' }))
    .concat(vacantRoles.map(role => ({ profileId: 'empty', title: role })))

  const [executives, setExecutives] = useState<{ profileId: string, title: string }[]>(initialExecs)

  // Reset state when opened
  React.useEffect(() => {
    if (open) {
      const execs = members
        .filter(m => m.role === 'owner' || m.role === 'admin')
        .map(m => ({ profileId: m.id, title: m.executive_title || 'Executive' }))
        .concat(vacantRoles.map(role => ({ profileId: 'empty', title: role })))
      
      // Ensure owner is always at index 0
      const ownerIdx = execs.findIndex(e => e.profileId === currentUserId)
      if (ownerIdx > 0) {
        const owner = execs.splice(ownerIdx, 1)[0]
        execs.unshift(owner)
      } else if (ownerIdx === -1) {
        execs.unshift({ profileId: currentUserId, title: 'President / Owner' })
      }
      
      setExecutives(execs)
    }
  }, [open, members, currentUserId])

  const availableMembers = members.filter(
    m => !executives.find(e => e.profileId === m.id)
  )

  const addExecutive = () => {
    setExecutives([...executives, { profileId: '', title: '' }])
  }

  const removeExecutive = (index: number) => {
    const newExecs = [...executives]
    newExecs.splice(index, 1)
    setExecutives(newExecs)
  }

  const updateExecutive = (index: number, field: 'profileId' | 'title', value: string) => {
    const newExecs = [...executives]
    newExecs[index][field] = value
    setExecutives(newExecs)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const invalidExec = executives.find(e => !e.title.trim())
    if (invalidExec) {
      toast.error("Please provide a title for all rows, or remove empty rows.")
      return
    }

    setIsPending(true)
    
    const formData = new FormData()
    formData.set('executives', JSON.stringify(executives))
    
    const result = await updateBoard(orgSlug, orgId, null, formData)
    
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Executive Board updated!')
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button variant="outline" className="text-primary border-primary/20 hover:bg-primary/10" />
        }
      >
        <Settings2Icon className="mr-2 size-4" />
        Manage Board
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Executive Board</DialogTitle>
          <DialogDescription>
            Add or remove members from the Executive Board, and assign their official titles.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
            <div className="flex justify-end pt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addExecutive}
                className="text-primary border-primary/20 hover:bg-primary/10"
              >
                <PlusIcon className="mr-2 size-4" />
                Add Executive
              </Button>
            </div>

            <div className="space-y-4">
              {executives.map((exec, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-border rounded-lg bg-muted/50">
                  <div className="flex-1 space-y-2">
                    <Label>Select Member</Label>
                    <Select 
                      value={exec.profileId} 
                      onValueChange={(val: string | null) => updateExecutive(index, 'profileId', val || '')}
                      disabled={exec.profileId === currentUserId && index === 0}
                    >
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="Choose a member...">
                          {exec.profileId === currentUserId && index === 0 
                            ? 'You (Owner)'
                            : exec.profileId === 'empty'
                              ? 'Vacant (Assign Later)'
                              : exec.profileId
                                ? (members.find(m => m.id === exec.profileId)?.name || 'User')
                                : 'Choose a member...'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {index !== 0 && (
                          <SelectItem value="empty" className="text-muted-foreground italic">
                            Vacant (Assign Later)
                          </SelectItem>
                        )}
                        {exec.profileId === currentUserId && index === 0 && (
                          <SelectItem value={currentUserId}>You (Owner)</SelectItem>
                        )}
                        {index !== 0 && exec.profileId !== 'empty' && exec.profileId && !availableMembers.find(m => m.id === exec.profileId) && (
                          <SelectItem value={exec.profileId}>
                            {members.find(m => m.id === exec.profileId)?.name || 'User'}
                          </SelectItem>
                        )}
                        {availableMembers.map(m => (
                          <SelectItem key={m.id} value={m.id}>{m.name || 'User'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Executive Title</Label>
                    <Input 
                      value={exec.title}
                      onChange={(e) => updateExecutive(index, 'title', e.target.value)}
                      placeholder="e.g. Chief of Staff"
                      className="bg-background"
                      required
                    />
                  </div>
                  {index !== 0 && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      className="mt-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeExecutive(index)}
                    >
                      <Trash2Icon className="size-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border mt-auto">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="min-w-[140px]"
            >
              {isPending ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
