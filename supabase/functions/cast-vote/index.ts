import { serve } from 'https://deno.land/std@0.152.0/http/server.ts';
import supabase from '../_shared/supabase.ts';
import corsHeaders from '../_shared/cors.ts';
import { Poll, Vote } from '../_shared/types.ts';

const headers = {
  ...corsHeaders,
  'Content-Type': 'application/json',
};

console.log('Function cast-vote is running.');
serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('{}', { headers });
  }

  // Verify input
  const { pollId, voteOption } = await req.json();
  if (!pollId || !voteOption) {
    return new Response(
      JSON.stringify({ ok: false, message: 'Poll ID or vote option not provided.' }),
      {
        status: 400,
        headers,
      },
    );
  }

  // Get authentication and verify it
  const token = req.headers.get('Authorization')!.replace('Bearer ', '');
  let userId: string | null = null;
  if (token !== Deno.env.get('SUPABASE_ANON_KEY')) {
    const { user, error } = await supabase.auth.api.getUser(token);

    if (error || !user) {
      console.warn('User lookup was unsuccessful.', error);
      return new Response(
        JSON.stringify({ ok: false, message: error ? error.message : 'User not found.' }),
        {
          status: 400,
          headers,
        },
      );
    }
    userId = user.id;
  }

  // Check if poll exists
  const { data: pollData, error: pollError } = await supabase
    .from<Poll>('polls')
    .select('*')
    .eq('id', pollId);

  if (pollError) {
    return new Response(JSON.stringify({ ok: false, message: pollError.message }), {
      status: 500,
      headers,
    });
  }
  if (pollData === null || pollData.length === 0) {
    return new Response(JSON.stringify({ ok: false, message: 'Poll not found.' }), {
      status: 400,
      headers,
    });
  }

  const poll = pollData[0];

  // Check if option exists on poll
  if (!poll.options.includes(voteOption.toString())) {
    return new Response(JSON.stringify({ ok: false, message: 'Invalid option.' }), {
      status: 400,
      headers,
    });
  }
  // Check if poll is still open
  if (poll.close_at && new Date() >= new Date(poll.close_at)) {
    return new Response(JSON.stringify({ ok: false, message: 'Voting is closed.' }), {
      status: 403,
      headers,
    });
  }


  // Create vote
  const { data: voteData, error: voteError } = await supabase.from<Vote>('votes').insert([
    {
      poll_id: pollId,
      option: voteOption,
      user_id: userId || undefined,
    },
  ]);

  if (voteData === null || voteData.length === 0 || voteError) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: voteError ? voteError.message : 'Something went wrong.',
      }),
      { status: 500, headers },
    );
  }

  return new Response(
    JSON.stringify({ ok: true, message: 'Vote recorded.', vote: voteData[0] }),
    { headers },
  );
});
