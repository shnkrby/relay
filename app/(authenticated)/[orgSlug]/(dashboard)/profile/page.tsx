import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Building2Icon, UserIcon } from 'lucide-react'
import Link from 'next/link'
import { AvatarUpload } from './_components/avatar-upload'
import { ProfileForm } from './_components/profile-form'
import { LeaveOrgButton } from './_components/leave-org-button'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all organizations the user belongs to
  const { data: memberships } = await supabase
    .from('org_members')
    .select(`
      role,
      joined_at,
      organizations (
        id,
        name,
        slug
      )
    `)
    .eq('profile_id', user.id)

  const orgs = memberships?.map((m: any) => ({
    id: m.organizations?.id,
    name: m.organizations?.name || 'Unknown',
    slug: m.organizations?.slug || '',
    role: m.role,
    joinedAt: m.joined_at,
  })).filter((o: any) => o.slug) || []

  const fullName = profile?.full_name || user.user_metadata?.full_name || ''
  const email = user.email || ''
  const avatarUrl = profile?.avatar_url || null
  const initials = fullName
    ? fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : email.substring(0, 2).toUpperCase()

  const roleColors: Record<string, string> = {
    owner: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none',
    admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-none',
    member: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-none',
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <UserIcon className="size-8 text-blue-600" />
            My Profile
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Manage your account details and profile picture.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
        {/* Gradient banner */}
        <div className="h-24 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600" />
        <div className="px-6 -mt-14">
          <AvatarUpload currentAvatarUrl={avatarUrl} initials={initials} />
        </div>
        <CardContent className="pt-6 px-6 pb-8">
          <ProfileForm
            fullName={fullName}
            email={email}
            createdAt={profile?.created_at || user.created_at}
          />
        </CardContent>
      </Card>

      {/* Organizations */}
      <Card className="shadow-sm border-slate-200/80 dark:border-slate-800/80">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2Icon className="size-5 text-blue-600" />
            <CardTitle className="text-lg">My Organizations</CardTitle>
          </div>
          <CardDescription>
            Organizations you are a member of.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {orgs.length === 0 ? (
            <div className="text-center py-8">
              <Building2Icon className="size-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                You are not a member of any organizations yet.
              </p>
              <Link
                href="/organizations"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-2 inline-block"
              >
                Browse Organizations →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orgs.map((org: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group"
                >
                  <Link
                    href={`/${org.slug}`}
                    className="flex items-center gap-3 flex-1"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold text-sm shrink-0">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {org.name}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Joined {new Date(org.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={`capitalize text-xs ${roleColors[org.role] || roleColors.member}`}>
                      {org.role}
                    </Badge>
                    <LeaveOrgButton orgId={org.id} orgSlug={org.slug} orgName={org.name} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
