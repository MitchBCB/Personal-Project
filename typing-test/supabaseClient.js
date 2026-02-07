import { SUPABASE_URL, SUPABASE_KEY } from "./config.js";

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

export { sb };
