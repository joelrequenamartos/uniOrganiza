/**
 * Database types — hand-written to match supabase/migrations/0001_init.sql.
 * Regenerate from the live schema anytime with:
 *   npx supabase gen types typescript --project-id duafzhepygqmsnvxhkqv > types/database.ts
 */

export type EventTypeDb = "class" | "assignment" | "activity" | "exam";
export type EventSourceDb = "manual" | "university";
export type EventStatusDb = "pending" | "completed" | "read_only";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; timezone: string; created_at: string };
        Insert: { id: string; timezone?: string; created_at?: string };
        Update: { id?: string; timezone?: string; created_at?: string };
        Relationships: [];
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          external_ref: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          external_ref?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          external_ref?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          type: EventTypeDb;
          title: string;
          description: string | null;
          start_at: string | null;
          end_at: string | null;
          due_at: string | null;
          all_day: boolean;
          status: EventStatusDb;
          source: EventSourceDb;
          external_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id?: string | null;
          type: EventTypeDb;
          title: string;
          description?: string | null;
          start_at?: string | null;
          end_at?: string | null;
          due_at?: string | null;
          all_day?: boolean;
          status?: EventStatusDb;
          source?: EventSourceDb;
          external_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string | null;
          type?: EventTypeDb;
          title?: string;
          description?: string | null;
          start_at?: string | null;
          end_at?: string | null;
          due_at?: string | null;
          all_day?: boolean;
          status?: EventStatusDb;
          source?: EventSourceDb;
          external_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_subject_id_fkey";
            columns: ["subject_id"];
            referencedRelation: "subjects";
            referencedColumns: ["id"];
          },
        ];
      };
      external_calendars: {
        Row: {
          id: string;
          user_id: string;
          provider: "ics" | "google";
          url: string | null;
          name: string | null;
          last_synced_at: string | null;
          sync_state: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: "ics" | "google";
          url?: string | null;
          name?: string | null;
          last_synced_at?: string | null;
          sync_state?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: "ics" | "google";
          url?: string | null;
          name?: string | null;
          last_synced_at?: string | null;
          sync_state?: Record<string, unknown> | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      event_type: EventTypeDb;
      event_source: EventSourceDb;
      event_status: EventStatusDb;
    };
    CompositeTypes: Record<string, never>;
  };
}
