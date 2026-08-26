import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qdwziqslnbrivpnpgyan.supabase.co";
const supabaseKey = "sb_publishable_Jdb22SFQnLE5qGND3ZQcHw_glUPYyUJ";

export const supabase = createClient(supabaseUrl, supabaseKey);