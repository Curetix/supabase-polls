import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_KEY!,
);

async function run() {
  // @ts-ignore
  const args = Bun.argv;
  console.log(args);

  const pollId = args.length > 2 ? args[2].toString() : null;
  const votes = 1000;
  const maxDelay = 200;

  if (!pollId) {
    console.error("No poll ID provided.");
    return;
  }

  const { data, error } = await supabase.from("polls").select("*").eq("id", pollId);

  if (error || !data) {
    if (error) console.log(error);
    else console.error("Poll not found.");
    return;
  }

  const options = data[0].options;

  function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  for (let i = 0; i < votes; i++) {
    const o = options[getRandomInt(0, options.length - 1)];
    console.log(`Placing vote for ${o}`);
    const { error: e } = await supabase.from("votes").insert([
      {
        poll_id: pollId,
        option: o,
      },
    ]);
    if (e) {
      console.error(e);
      console.log("Stopping because of unexpected error.");
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, getRandomInt(10, maxDelay)));
  }
}

await run();
