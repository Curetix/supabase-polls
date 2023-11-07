import { Database } from "@/types/database";

declare type Poll = Database["public"]["Tables"]["polls"]["Row"];
declare type Vote = Database["public"]["Tables"]["votes"]["Row"];
declare type VoteCount = Database["public"]["Functions"]["count_poll_votes"]["Returns"];

type ErrorApiResponse<T> = {
  success: false;
  error: string;
  message?: string | null;
  details?: any;
  data?: null;
};

type SuccessApiResponse<T> = {
  success: true;
  error?: null;
  message?: string | null;
  details?: any;
  data?: T;
};

declare type ApiResponse<T = unknown> = SuccessApiResponse<T> | ErrorApiResponse<T>;
