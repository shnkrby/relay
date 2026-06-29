"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { 
  SearchIcon, 
  MoreVerticalIcon, 
  CheckCircle2Icon,
  PlayIcon,
  ClockIcon,
  UserCircle2Icon
} from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import { updateTaskStatus } from '../../duties/[dutyId]/_actions/update-task-status'

export interface TaskDto {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  assignees: {
    id: string
    full_name: string | null
    email: string | null
    avatar_url?: string | null
  }[]
  duty: {
    id: string
    name: string
    committee: {
      name: string
    } | null
    event: {
      title: string
    } | null
  } | null
}

interface TaskTableProps {
  tasks: TaskDto[]
  isAdmin: boolean
  currentUserId: string
  orgSlug: string
}

export function TaskTable({ tasks, isAdmin, currentUserId, orgSlug }: TaskTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'my_tasks'>(isAdmin ? 'all' : 'my_tasks')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  const handleStatusUpdate = async (taskId: string, dutyId: string, newStatus: any) => {
    const result = await updateTaskStatus(taskId, dutyId, orgSlug, newStatus)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success('Task status updated!')
      router.refresh()
    }
  }

  // Pre-filter tasks by tab
  const tabFilteredTasks = activeTab === 'all' 
    ? tasks 
    : tasks.filter(t => t.assignees?.some(a => a.id === currentUserId))

  const filteredTasks = tabFilteredTasks.filter((t) => {
    const s = search.toLowerCase()
    
    // Check if any assignee matches search
    const assigneeMatch = t.assignees?.some(a => 
      a.full_name?.toLowerCase().includes(s) || a.email?.toLowerCase().includes(s)
    )

    const matchesSearch = 
      t.title.toLowerCase().includes(s) ||
      assigneeMatch ||
      t.duty?.name.toLowerCase().includes(s) ||
      t.duty?.committee?.name.toLowerCase().includes(s) ||
      t.duty?.event?.title.toLowerCase().includes(s)

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const TableContent = () => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Assignees</TableHead>
            <TableHead>Duty</TableHead>
            <TableHead>Committee</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No tasks found.
              </TableCell>
            </TableRow>
          ) : (
            filteredTasks.map((t) => {
              const isAssignedToMe = t.assignees?.some(a => a.id === currentUserId)
              
              return (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={`capitalize
                      ${t.status === 'pending' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400 border-none' : ''}
                      ${t.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400 border-none' : ''}
                      ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none' : ''}
                    `}
                  >
                    {t.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`capitalize
                      ${t.priority === 'high' ? 'border-red-200 text-red-600 dark:border-red-900 dark:text-red-400' : ''}
                      ${t.priority === 'medium' ? 'border-amber-200 text-amber-600 dark:border-amber-900 dark:text-amber-400' : ''}
                      ${t.priority === 'low' ? 'border-blue-200 text-blue-600 dark:border-blue-900 dark:text-blue-400' : ''}
                    `}
                  >
                    {t.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  {t.assignees && t.assignees.length > 1 ? (
                    <Dialog>
                      <DialogTrigger render={<button className="text-blue-600 hover:underline dark:text-blue-400 font-medium">Group ({t.assignees.length})</button>} />
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Assigned Members</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 py-4">
                          {t.assignees.map(a => (
                            <div key={a.id} className="flex items-center gap-3 border p-3 rounded-md bg-slate-50 dark:bg-slate-900/50">
                              <Avatar className="size-10">
                                <AvatarImage src={a.avatar_url || ''} alt={a.full_name || a.email || 'Unknown'} />
                                <AvatarFallback className="bg-secondary text-muted-foreground text-sm font-medium">
                                  {(a.full_name || a.email || 'U').substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-medium text-sm text-slate-900 dark:text-white">{a.full_name || 'Unknown'}</span>
                                <span className="text-xs text-muted-foreground">{a.email}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : t.assignees && t.assignees.length === 1 ? (
                    t.assignees[0].full_name || t.assignees[0].email
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>{t.duty?.name || 'N/A'}</TableCell>
                <TableCell>{t.duty?.committee?.name || 'N/A'}</TableCell>
                <TableCell>
                  {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell>
                  {t.duty?.id && isAssignedToMe && (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVerticalIcon className="size-4" />
                            <span className="sr-only">Open actions</span>
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end">
                        {t.status === 'pending' && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(t.id, t.duty!.id, 'in_progress')}>
                            <PlayIcon className="mr-2 size-4 text-blue-500" />
                            Start Task
                          </DropdownMenuItem>
                        )}
                        {(t.status === 'pending' || t.status === 'in_progress') && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(t.id, t.duty!.id, 'completed')}>
                            <CheckCircle2Icon className="mr-2 size-4 text-emerald-500" />
                            Mark Completed
                          </DropdownMenuItem>
                        )}
                        {t.status === 'completed' && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(t.id, t.duty!.id, 'in_progress')}>
                            <ClockIcon className="mr-2 size-4 text-amber-500" />
                            Reopen Task
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            )})
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
      <CardHeader className="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative w-full md:max-w-sm">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tasks..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val || 'all')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-6">

      {isAdmin ? (
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="my_tasks">My Tasks</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <TableContent />
          </TabsContent>
          <TabsContent value="my_tasks" className="mt-0">
            <TableContent />
          </TabsContent>
        </Tabs>
      ) : (
        <TableContent />
      )}
      </CardContent>
    </Card>
  )
}
