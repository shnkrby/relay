// Enums
export type OrgRole = 'owner' | 'admin' | 'member';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high';

// Tables
export interface Profile {
  id: string; // UUID
  full_name: string;
  email: string;
  avatar_url: string | null;
  created_at: string; // TIMESTAMPTZ
}

export interface Organization {
  id: string; // UUID
  name: string;
  slug: string;
  join_code: string;
  logo_url: string | null;
  created_at: string; // TIMESTAMPTZ
}

export interface OrgMember {
  org_id: string; // UUID
  profile_id: string; // UUID
  role: OrgRole;
  joined_at: string; // TIMESTAMPTZ
}

export interface Committee {
  id: string; // UUID
  org_id: string; // UUID
  name: string;
  description: string | null; // TEXT
  executive_id: string | null; // UUID
  lead_id: string | null; // UUID
  member_limit: number | null; // INTEGER
  created_at: string; // TIMESTAMPTZ
}

export interface CommitteeMember {
  committee_id: string; // UUID
  profile_id: string; // UUID
  joined_at: string; // TIMESTAMPTZ
}

export interface Event {
  id: string; // UUID
  org_id: string; // UUID
  title: string;
  description: string | null;
  status: EventStatus;
  start_date: string | null; // TIMESTAMPTZ
  end_date: string | null; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
}

export interface Task {
  id: string; // UUID
  event_id: string; // UUID
  committee_id: string; // UUID
  assignee_id: string | null; // UUID
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date: string | null; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
}
