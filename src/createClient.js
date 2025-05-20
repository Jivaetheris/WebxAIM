import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://mxmmllgegtjlovqbxqqg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14bW1sbGdlZ3RqbG92cWJ4cXFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0OTE0NDcsImV4cCI6MjA2MjA2NzQ0N30.gVvGZCpjYJYc1ZB5_BE1f1VwKyMDtnXQjavb38jDg6o";

export const supabase = createClient(supabaseUrl, supabaseKey);