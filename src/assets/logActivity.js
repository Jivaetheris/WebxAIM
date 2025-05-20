import { supabase } from "../createClient";

export async function logActivity(action) {
  await supabase.from("activity_logs").insert([
    {
      action,
      timestamp: new Date().toISOString(),
    },
  ]);
}
