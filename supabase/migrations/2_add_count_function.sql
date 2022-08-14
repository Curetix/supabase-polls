CREATE OR REPLACE function count_poll_votes(poll bigint)
RETURNS TABLE(option text, votes int)
LANGUAGE SQL
AS $$
  SELECT option, count(*) as votes
  FROM public.votes
  WHERE poll_id = poll
  GROUP BY option
  ORDER BY votes DESC;
$$;
