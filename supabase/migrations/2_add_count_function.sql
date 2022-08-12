CREATE OR REPLACE function count_poll_votes(bigint)
RETURNS TABLE(option text, votes int)
LANGUAGE SQL
AS $$
  SELECT option, count(*) as votes
  FROM public.votes
  WHERE poll_id = $1
  GROUP BY option
  ORDER BY votes DESC;
$$;
