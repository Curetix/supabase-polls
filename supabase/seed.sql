INSERT INTO public.polls (id, title, options, close_at)
VALUES ('your-os', 'Your OS?', ARRAY ['Windows','Linux','MacOS'], now() + '1 year'::interval);

INSERT INTO public.votes (poll_id, option) VALUES ('your-os', 'Windows');
INSERT INTO public.votes (poll_id, option) VALUES ('your-os', 'Windows');
INSERT INTO public.votes (poll_id, option) VALUES ('your-os', 'Linux');
INSERT INTO public.votes (poll_id, option) VALUES ('your-os', 'Linux');
INSERT INTO public.votes (poll_id, option) VALUES ('your-os', 'Linux');
INSERT INTO public.votes (poll_id, option) VALUES ('your-os', 'Linux');
INSERT INTO public.votes (poll_id, option) VALUES ('your-os', 'Linux');
INSERT INTO public.votes (poll_id, option) VALUES ('your-os', 'MacOS');
INSERT INTO public.votes (poll_id, option) VALUES ('your-os', 'MacOS');


INSERT INTO public.polls (id, title, options, close_at, allow_multiple_answers)
VALUES ('prog-lang', 'Favourite programming language?', ARRAY ['Python','Java','JavaScript','C++','C#'], now() + '1 year'::interval, true);

INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'Python');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'Python');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'Python');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'Python');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'Python');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'Python');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'JavaScript');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'JavaScript');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'JavaScript');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'JavaScript');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'JavaScript');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'Java');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'Java');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'C++');
INSERT INTO public.votes (poll_id, option) VALUES ('prog-lang', 'C#');


INSERT INTO public.polls (id, title, options, close_at)
VALUES ('best-platform', 'Best App Platform?', ARRAY ['Firebase','Supabase','AWS Amplify'], now() + '1 year'::interval);

INSERT INTO public.votes (poll_id, option) VALUES ('best-platform', 'Supabase');
INSERT INTO public.votes (poll_id, option) VALUES ('best-platform', 'Supabase');
INSERT INTO public.votes (poll_id, option) VALUES ('best-platform', 'Supabase');
INSERT INTO public.votes (poll_id, option) VALUES ('best-platform', 'Supabase');
INSERT INTO public.votes (poll_id, option) VALUES ('best-platform', 'Supabase');
INSERT INTO public.votes (poll_id, option) VALUES ('best-platform', 'Firebase');
INSERT INTO public.votes (poll_id, option) VALUES ('best-platform', 'Firebase');
INSERT INTO public.votes (poll_id, option) VALUES ('best-platform', 'Firebase');
INSERT INTO public.votes (poll_id, option) VALUES ('best-platform', 'AWS Amplify');
