import { Database } from "@/utils/supabase/database.types";
import { createServerClient } from "@supabase/ssr";

export const createClient = () =>
  createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_SUPABASE_SERVICE_KEY as string,
    { cookies: {} },
  );
