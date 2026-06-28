'use client'

import * as React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2Icon, PlusIcon, Trash2Icon, ShieldCheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { completeSetup } from '../_actions/complete-setup'

interface Member {
  id: string
  name: string
  email: string
  role: string
}

interface SetupWizardProps {
  orgId: string
  orgSlug: string
  members: Member[]
  currentUserId: string
}

export function SetupWizard({ orgId, orgSlug, members, currentUserId }: SetupWizardProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  
  // State for executives: list of { profileId, title }
  const [executives, setExecutives] = useState<{ profileId: string, title: string }[]>([
    { profileId: currentUserId, title: 'President / Owner' }
  ])

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
    
    // Validation: title is required, but profileId can be 'empty'
    const invalidExec = executives.find(e => !e.title.trim())
    if (invalidExec) {
      toast.error("Please provide a title for all rows, or remove empty rows.")
      return
    }

    setIsPending(true)
    
    // Prepare data
    const formData = new FormData()
    formData.set('executives', JSON.stringify(executives))
    
    const result = await completeSetup(orgSlug, orgId, null, formData)
    
    setIsPending(false)
    
    if (!result.success) {
      toast.error(result.error)
      return
    }

    toast.success('Leadership board established!')
    router.push(`/${orgSlug}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4 pt-4 pb-8">
        <div className="bg-primary/10 p-4 rounded-full">
          <ShieldCheckIcon className="size-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to your Workspace</h1>
        <p className="text-muted-foreground text-center max-w-md">Configure your executive board to get started.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-semibold text-foreground">Executive Board</h3>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={addExecutive}
          >
            <PlusIcon className="mr-2 size-4" />
            Add Executive
          </Button>
        </div>

        {executives.map((exec, index) => (
          <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-border rounded-xl bg-card shadow-sm">
            <div className="flex-1 w-full space-y-2">
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
            <div className="flex-1 w-full space-y-2">
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

      <div className="pt-6 border-t flex justify-end">
        <Button 
          type="submit" 
          size="lg"
          className="w-full sm:w-auto min-w-[200px]"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              Finalizing Setup...
            </>
          ) : (
            'Complete Setup'
          )}
        </Button>
      </div>
    </form>
  )
}
