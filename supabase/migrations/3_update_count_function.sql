CREATE OR REPLACE function count_poll_votes(poll bigint)
RETURNS TABLE(option text, votes int)
LANGUAGE SQL
AS $$
    SELECT DISTINCT ON (option) option, votes
    FROM (
      SELECT option, count(*) as votes FROM public.votes WHERE "poll_id" = poll GROUP BY option
      UNION
      SELECT option, 0 as votes FROM public.polls, unnest("options") AS "option" WHERE "id" = poll
    ) AS t
    ORDER BY option, votes DESC;
$$;
