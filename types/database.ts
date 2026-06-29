// Enums
export type OrgRole = 'owner' | 'admin' | 'member';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type EventStatus = 'upcoming' | 'active' | 'completed' | 'cancelled' | 'paused';
export type PriorityLevel = 'low' | 'medium' | 'high';
export type NotificationType = 'task_assigned' | 'task_completed' | 'duty_assigned' | 'event_created' | 'role_changed' | 'member_joined';

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
  description: string | null; // TEXT
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
  logo_url: string | null; // TEXT
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

export interface EventDuty {
  id: string; // UUID
  event_id: string; // UUID
  committee_id: string; // UUID
  name: string;
  created_at: string; // TIMESTAMPTZ
}

export interface Task {
  id: string; // UUID
  duty_id: string; // UUID
  assigner_id: string | null; // UUID
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date: string | null; // TIMESTAMPTZ
  overdue_reason: string | null; // TEXT
  completion_report: string | null; // TEXT
  created_at: string; // TIMESTAMPTZ
  updated_at?: string; // TIMESTAMPTZ
}

export interface Notification {
  id: string; // UUID
  recipient_id: string; // UUID
  org_id: string; // UUID
  type: NotificationType;
  title: string;
  message: string;
  link: string | null; // TEXT
  is_read: boolean;
  created_at: string; // TIMESTAMPTZ
}
