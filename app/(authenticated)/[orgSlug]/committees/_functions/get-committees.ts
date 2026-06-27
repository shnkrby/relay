import { createClient } from '@/lib/supabase/server'
import { Committee } from '@/types/database'

export async function getCommittees(orgId: string, userId: string, role: string) {
  const supabase = await createClient()

  if (role === 'owner' || role === 'admin') {
    // Admin sees all committees
    const { data, error } = await supabase
      .from('committees')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching all committees:', error.message, error.details)
      throw new Error(`Database error fetching committees: ${error.message}`)
    }
    return data as Committee[]
  } else {
    // Member sees joined committees
    const { data, error } = await supabase
      .from('committee_members')
      .select('committees(*)')
      .eq('profile_id', userId)
      
    if (error) {
      console.error('Error fetching joined committees:', error.message, error.details)
      throw new Error(`Database error fetching joined committees: ${error.message}`)
    }
    
    // Extract committees from the join table result
    return (data?.map((row: any) => row.committees).filter(Boolean) || []) as Committee[]
  }
}
