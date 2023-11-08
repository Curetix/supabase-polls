import { createServiceClient } from "@/app/api/supabase.ts";
import { ApiResponse, Vote } from "@/types/common";
import { Database } from "@/types/database";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

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

const supabaseServiceClient = createServiceClient();

export type CreateVoteRequest = z.infer<typeof voteSchema>;

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Vote>>> {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  // Validate poll according to schema
  const inputVote = await request.json();
  const validatedVote = voteSchema.safeParse(inputVote);
  if (!validatedVote.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request",
        details: fromZodError(validatedVote.error).message,
      },
      { status: 400 },
    );
  }
  const { pollId, voteOption } = validatedVote.data;
  const voteOptionArray = Array.isArray(voteOption) ? voteOption : [voteOption];

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Error during session lookup:", sessionError);
    return NextResponse.json(
      { success: false, error: sessionError.message },
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
      { success: false, error: pollError.message },
      {
        status: 500,
      },
    );
  }
  if (!pollData) {
    return NextResponse.json(
      { success: false, error: "Poll not found." },
      {
        status: 400,
      },
    );
  }

  const poll = pollData[0];

  // Check if poll is still open
  if (poll.close_at && new Date() >= new Date(poll.close_at)) {
    return NextResponse.json(
      { success: false, error: "Voting is closed." },
      {
        status: 403,
      },
    );
  }
  // If vote contains multiple answers, check if that is allowed
  if (!poll.allow_multiple_answers && voteOptionArray.length > 1) {
    return NextResponse.json(
      {
        success: false,
        error: "Poll does not allow multiple answers.",
      },
      { status: 400 },
    );
  }
  // Check if option(s) exist(s) on poll
  if (!voteOptionArray.every((value) => poll.options.includes(value))) {
    return NextResponse.json(
      {
        success: false,
        error: poll.allow_multiple_answers ? "At least one option is invalid." : "Invalid option.",
      },
      { status: 400 },
    );
  }

  // Create vote
  const { data: voteData, error: voteError } = await supabaseServiceClient
    .from("votes")
    .insert(
      voteOptionArray.map((option) => ({
        poll_id: pollId,
        option,
        user_id: session?.user.id,
      })),
    )
    .select();

  if (voteError || !voteData) {
    return NextResponse.json(
      {
        success: false,
        error: voteError ? voteError.message : "Something went wrong.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, message: "Vote recorded.", data: voteData[0] });
}
