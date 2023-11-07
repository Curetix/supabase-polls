import { Database } from "@/utils/supabase/database.types";

declare type ApiResponse = {
  message?: string;
  error?: boolean;
};

declare type Poll = Database["public"]["Tables"]["polls"]["Row"];
declare type Vote = Database["public"]["Tables"]["votes"]["Row"];
declare type VoteCount = Database["public"]["Functions"]["count_poll_votes"]["Returns"];
