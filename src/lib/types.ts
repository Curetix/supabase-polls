export type Poll = {
  id: number;
  shareable_id: string;
  user_id?: string;
  title?: string;
  is_unlisted?: boolean;
  created_at: string;
  close_at: string;
  allow_multiple_answers?: boolean;
  options: string[];
};

export type Vote = {
  id: number;
  created_at: string;
  poll_id: string;
  user_id?: string;
  option: string;
};

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
