export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      polls: {
        Row: {
          title: string;
          options: string[];
          user_id: string | null;
          id: string;
          created_at: string;
          close_at: string;
          is_unlisted: boolean | null;
          allow_multiple_answers: boolean | null;
        };
        Insert: {
          title: string;
          options: string[];
          user_id?: string | null;
          id?: string;
          created_at?: string;
          close_at?: string;
          is_unlisted?: boolean | null;
          allow_multiple_answers?: boolean | null;
        };
        Update: {
          title?: string;
          options?: string[];
          user_id?: string | null;
          id?: string;
          created_at?: string;
          close_at?: string;
          is_unlisted?: boolean | null;
          allow_multiple_answers?: boolean | null;
        };
      };
      votes: {
        Row: {
          id: number;
          poll_id: string;
          user_id: string | null;
          option: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          poll_id: string;
          user_id?: string | null;
          option?: string | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          poll_id?: string;
          user_id?: string | null;
          option?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      nanoid: {
        Args: { size: number; alphabet: string };
        Returns: string;
      };
      count_poll_votes: {
        Args: { poll: string };
        Returns: {
          option: string,
          votes: number,
        };
      };
    };
  };
}

export type Poll = Database['public']['Tables']['polls']['Row'];

export type Vote = Database['public']['Tables']['votes']['Row'];

type BaseResponse = {
  ok: boolean;
  message: string;
};

export type CreatePollResponse = BaseResponse & {
  validation?: any;
  poll?: Poll;
};

export type CastVoteResponse = BaseResponse & {
  vote?: Vote;
};
