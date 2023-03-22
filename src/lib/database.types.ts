export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      polls: {
        Row: {
          allow_multiple_answers: boolean | null;
          close_at: string;
          created_at: string;
          id: string;
          is_unlisted: boolean | null;
          options: string[];
          title: string;
          user_id: string | null;
        };
        Insert: {
          allow_multiple_answers?: boolean | null;
          close_at?: string;
          created_at?: string;
          id?: string;
          is_unlisted?: boolean | null;
          options: string[];
          title: string;
          user_id?: string | null;
        };
        Update: {
          allow_multiple_answers?: boolean | null;
          close_at?: string;
          created_at?: string;
          id?: string;
          is_unlisted?: boolean | null;
          options?: string[];
          title?: string;
          user_id?: string | null;
        };
      };
      votes: {
        Row: {
          created_at: string;
          id: number;
          option: string | null;
          poll_id: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          option?: string | null;
          poll_id: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          option?: string | null;
          poll_id?: string;
          user_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      count_poll_votes: {
        Args: {
          poll: string;
        };
        Returns: {
          option: string;
          votes: number;
        }[];
      };
      nanoid: {
        Args: {
          size?: number;
          alphabet?: string;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          created_at: string | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Poll = Database["public"]["Tables"]["polls"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];
export type VoteCount = Database["public"]["Functions"]["count_poll_votes"]["Returns"];

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
