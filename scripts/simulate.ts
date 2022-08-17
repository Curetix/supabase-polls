import { parse } from 'https://deno.land/std@0.136.0/flags/mod.ts';

import supabase from '../supabase/functions/_shared/supabase.ts';
import { Poll, Vote } from '../supabase/functions/_shared/types.ts';

const args = parse(Deno.args);
const pollId = args._.length > 0 ? args._[0].toString() : null;

if (!pollId) {
  console.error('No poll ID provided.');
  Deno.exit(1);
}

const { data, error } = await supabase.from<Poll>('polls').select('*').eq('id', pollId);

if (error || !data || data.length === 0) {
  if (error) console.log(error);
  else console.error('Poll not found.');
  Deno.exit(1);
}

const options = data[0].options;

const votes = 69;

function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const o = options[getRandomInt(0, options.length - 1)];
for (let i = 0; i < votes; i++) {
  console.log(`Placing vote for ${o}`);
  const { error: e } = await supabase.from<Vote>('votes').insert([
    {
      poll_id: pollId,
      option: o,
    },
  ]);
  if (e) {
    console.error(e);
    console.log('Stopping because of unexpected error.');
    break;
  }
  await new Promise((resolve) => setTimeout(resolve, getRandomInt(10, 500)));
}
