export type Poll = {
  id: string;
  user_id?: string;
  title: string;
  is_unlisted?: boolean;
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
