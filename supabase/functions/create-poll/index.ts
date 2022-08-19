import { serve } from 'https://deno.land/std@0.152.0/http/server.ts';
import { z } from 'https://deno.land/x/zod@v3.18.0/index.ts';
import supabase from '../_shared/supabase.ts';
import corsHeaders from '../_shared/cors.ts';

const headers = {
  ...corsHeaders,
  'Content-Type': 'application/json',
};

const trimString = (u: unknown) => (typeof u === 'string' ? u.trim() : u);
const pollSchema = z.object({
  title: z.preprocess(trimString, z.string().min(1)),
  is_unlisted: z.boolean().optional(),
  close_at: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined) return true;
        return !isNaN(Date.parse(val)) && new Date() < new Date(val);
      },
      { message: 'Poll close date is invalid or in the past.' },
    ),
  allow_multiple_answers: z.boolean().optional(),
  options: z
    .array(z.preprocess(trimString, z.string().min(1)))
    .min(2)
    .max(5)
    .refine((val) => new Set(val).size === val.length, {
      message: 'Poll options contain duplicates.',
    }),
}).strict();

console.log('Function create-poll is running.');
serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('{}', { headers });
  }

  const inputPoll = await req.json();

  // Validate poll according to schema
  const validatedPoll = pollSchema.safeParse(inputPoll);
  if (!validatedPoll.success) {
    console.warn('Poll Input is invalid', validatedPoll.error);
    return new Response(
      JSON.stringify({
        ok: false,
        message: 'Request is invalid.',
        validation: validatedPoll.error,
      }),
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
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data || !data.user) {
      console.warn('User lookup was unsuccessful.', error);
      return new Response(
        JSON.stringify({ ok: false, message: error ? error.message : 'User not found.' }),
        {
          status: 400,
          headers,
        },
      );
    }
    userId = data.user.id;
  }

  // Create poll
  const { data, error } = await supabase.from('polls')
    .insert([
      {
        ...validatedPoll.data,
        user_id: userId || undefined,
      },
    ])
    .select();

  if (!data || error) {
    console.error('Error during poll creation', data, error);
    return new Response(
      JSON.stringify({
        ok: false,
        message: error ? error.message : 'Something went wrong.',
      }),
      {
        status: 500,
        headers,
      },
    );
  }

  return new Response(
    JSON.stringify({ ok: true, message: 'Poll created.', poll: data[0] }),
    { headers },
  );
});
