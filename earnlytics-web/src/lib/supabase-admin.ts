import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type AdminDatabase = {
  public: {
    Tables: Record<
      string,
      {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      }
    >;
    Views: Record<string, never>;
    Functions: Record<
      string,
      {
        Args: Record<string, unknown>;
        Returns: unknown;
      }
    >;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

let adminClient: SupabaseClient<AdminDatabase> | null = null;

export function getSupabaseAdmin(): SupabaseClient<AdminDatabase> | null {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient<AdminDatabase>(supabaseUrl, serviceRoleKey);
  }

  return adminClient;
}
