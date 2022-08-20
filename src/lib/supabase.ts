import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default createClient<Database>(supabaseUrl, supabaseAnonKey);

const urlParts = supabaseUrl.split('.');
export const functionsUrl = supabaseUrl.match(/(supabase\.co)|(supabase\.in)/)
  ? `${urlParts[0]}.functions.${urlParts[1]}.${urlParts[2]}`
  : `${supabaseUrl}/functions/v1`;
