import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0-rc.4';
import { Database } from './database.types.ts';

export default createClient<Database>(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);
