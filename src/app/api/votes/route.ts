import { ApiResponse, Vote } from "@/types/common";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const trimString = (u: unknown) => (typeof u === "string" ? u.trim() : u);
const voteSchema = z.object({
  pollId: z.string(),
  voteOption: z.union([
    z.preprocess(trimString, z.string().min(1)),
    z
      .array(z.preprocess(trimString, z.string().min(1)))
      .min(1)
      .max(5)
      .refine((val) => new Set(val).size === val.length, {
        message: "Votes contain duplicates.",
      }),
  ]),
});

export type CreateVoteRequest = z.infer<typeof voteSchema>;
type CreateVoteResponse = ApiResponse & {
  vote?: Vote;
};

export async function POST(request: NextRequest): Promise<NextResponse<CreateVoteResponse>> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Validate poll according to schema
  const inputVote = await request.json();
  const validatedVote = voteSchema.safeParse(inputVote);
  if (!validatedVote.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Request is invalid.",
        validation: validatedVote.error,
      },
      { status: 400 },
    );
  }
  const { pollId, voteOption } = validatedVote.data;
  const voteOptionArray = Array.isArray(voteOption) ? voteOption : [voteOption];

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error during user lookup:", userError);
    return NextResponse.json(
      { error: true, message: userError.message },
      {
        status: 400,
      },
    );
  }

  // Check if poll exists
  const { data: pollData, error: pollError } = await supabase
    .from("polls")
    .select("*")
    .eq("id", pollId);

  if (pollError) {
    return NextResponse.json(
      { error: true, message: pollError.message },
      {
        status: 500,
      },
    );
  }
  if (!pollData) {
    return NextResponse.json(
      { error: true, message: "Poll not found." },
      {
        status: 400,
      },
    );
  }

  const poll = pollData[0];

  // Check if poll is still open
  if (poll.close_at && new Date() >= new Date(poll.close_at)) {
    return NextResponse.json(
      { error: true, message: "Voting is closed." },
      {
        status: 403,
      },
    );
  }
  // If vote contains multiple answers, check if that is allowed
  if (!poll.allow_multiple_answers && voteOptionArray.length > 1) {
    return NextResponse.json(
      {
        error: true,
        message: "Poll does not allow multiple answers.",
      },
      { status: 400 },
    );
  }
  // Check if option(s) exist(s) on poll
  if (!voteOptionArray.every((value) => poll.options.includes(value))) {
    return NextResponse.json(
      {
        error: true,
        message: poll.allow_multiple_answers
          ? "At least one option is invalid."
          : "Invalid option.",
      },
      { status: 400 },
    );
  }

  // Create vote
  const { data: voteData, error: voteError } = await supabase
    .from("votes")
    .insert(
      voteOptionArray.map((option) => ({
        poll_id: pollId,
        option,
        user_id: user?.id,
      })),
    )
    .select();

  if (voteError || !voteData) {
    return NextResponse.json(
      {
        error: true,
        message: voteError ? voteError.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Vote recorded.", vot: voteData[0] });
}
