// Temporary helper to bypass TypeScript errors until Supabase types regenerate
import { supabase } from "@/integrations/supabase/client";

// This helper bypasses type checking for database operations
// Types will auto-update after the database schema is fully synced
export const db = supabase as any;
