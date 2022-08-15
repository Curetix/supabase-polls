ALTER TABLE public.votes
DROP CONSTRAINT votes_poll_id_fkey,
ADD  CONSTRAINT votes_poll_id_fkey FOREIGN KEY (poll_id)
    REFERENCES public.polls (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
