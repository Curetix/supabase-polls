import { serve } from 'https://deno.land/std@0.152.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.18.0/index.ts';
import supabase from '../_shared/supabase.ts';
import corsHeaders from '../_shared/cors.ts';

const headers = {
  ...corsHeaders,
  'Content-Type': 'application/json',
};

const trimString = (u: unknown) => (typeof u === 'string' ? u.trim() : u);
const voteSchema = z.object({
  pollId: z.string(),
  voteOption: z.union([
    z.preprocess(trimString, z.string().min(1)),
    z
      .array(z.preprocess(trimString, z.string().min(1)))
      .min(1)
      .max(5)
      .refine((val) => new Set(val).size === val.length, {
        message: 'Votes contain duplicates.',
      }),
  ]),
});

console.log('Function cast-vote is running.');
serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('{}', { headers });
  }

  const inputVote = await req.json();

  // Validate poll according to schema
  const validatedVote = voteSchema.safeParse(inputVote);
  if (!validatedVote.success) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Request is invalid.',
        validation: validatedVote.error,
      }),
      { status: 400, headers },
    );
  }
  const { pollId, voteOption } = validatedVote.data;
  const voteOptionArray = Array.isArray(voteOption) ? voteOption : [voteOption];

  // Get authentication and verify it
  const token = req.headers.get('Authorization')!.replace('Bearer ', '');
  let userId: string | null = null;
  if (token !== Deno.env.get('SUPABASE_ANON_KEY')) {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data || !data.user) {
      console.warn('User lookup was unsuccessful.', error);
      return new Response(
        JSON.stringify({
          ok: false,
          message: error ? error.message : 'User not found.',
        }),
        { status: 400, headers },
      );
    }
    userId = data.user.id;
  }

  // Check if poll exists
  const { data: pollData, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId);

  if (pollError) {
    return new Response(
      JSON.stringify({ ok: false, message: pollError.message }),
      { status: 500, headers },
    );
  }
  if (!pollData) {
    return new Response(
      JSON.stringify({ ok: false, message: 'Poll not found.' }),
      { status: 400, headers },
    );
  }

  const poll = pollData[0];

  // Check if poll is still open
  if (poll.close_at && new Date() >= new Date(poll.close_at)) {
    return new Response(
      JSON.stringify({ ok: false, message: 'Voting is closed.' }),
      { status: 403, headers },
    );
  }
  // If vote contains multiple answers, check if that is allowed
  if (!poll.allow_multiple_answers && voteOptionArray.length > 1) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Poll does not allow multiple answers.',
      }),
      { status: 400, headers },
    );
  }
  // Check if option(s) exist(s) on poll
  if (!voteOptionArray.every((value) => poll.options.includes(value))) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: poll.allow_multiple_answers
          ? 'At least one option is invalid.'
          : 'Invalid option.',
      }),
      { status: 400, headers },
    );
  }

  // Create vote
  const { data: voteData, error: voteError } = await supabase
    .from('votes')
    .insert(
      voteOptionArray.map((option) => ({
        poll_id: pollId,
        option,
        user_id: userId || undefined,
      })),
    )
    .select();

  if (voteError || !voteData) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: voteError ? voteError.message : 'Something went wrong.',
      }),
      { status: 500, headers },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      message: 'Vote recorded.',
      vote: voteData.length > 1 ? voteData : voteData[0],
    }),
    { headers },
  );
});
