'use server'

import { createClient } from '@/lib/supabase/server'

export async function getCommitteeMembers(committeeId: string) {
  const supabase = await createClient()

  // 1. Get the committee lead_id
  const { data: committee, error: committeeError } = await supabase
    .from('committees')
    .select('lead_id')
    .eq('id', committeeId)
    .single()

  if (committeeError || !committee) {
    return { success: false, error: 'Failed to fetch committee details' }
  }

  // 2. Get the members
  const { data: membersData, error: membersError } = await supabase
    .from('committee_members')
    .select('profile_id, profiles(id, full_name, email, avatar_url)')
    .eq('committee_id', committeeId)

  if (membersError) {
    return { success: false, error: 'Failed to fetch committee members' }
  }

  // Process and format the data
  const members = membersData
    ?.map((row: any) => {
      const profile = row.profiles ? (Array.isArray(row.profiles) ? row.profiles[0] : row.profiles) : null
      
      const isLead = row.profile_id === committee.lead_id

      return {
        id: row.profile_id,
        name: profile?.full_name || profile?.email?.split('@')[0] || (isLead ? 'Committee Head (Pending Profile)' : 'Unknown Member'),
        email: profile?.email || 'No email',
        avatar_url: profile?.avatar_url,
        isLead
      }
    })

  // Sort so the lead is always at the top
  const sortedMembers = members?.sort((a, b) => {
    if (a?.isLead && !b?.isLead) return -1
    if (!a?.isLead && b?.isLead) return 1
    return 0
  })

  return { 
    success: true, 
    data: sortedMembers || [] 
  }
}
