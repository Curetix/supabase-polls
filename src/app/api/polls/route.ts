import { ApiResponse, Poll } from "@/types/common";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const trimString = (u: unknown) => (typeof u === "string" ? u.trim() : u);
const pollSchema = z
  .object({
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
        { message: "Poll close date is invalid or in the past." },
      ),
    allow_multiple_answers: z.boolean().optional(),
    options: z
      .array(z.preprocess(trimString, z.string().min(1)))
      .min(2)
      .max(5)
      .refine((val) => new Set(val).size === val.length, {
        message: "Poll options contain duplicates.",
      }),
  })
  .strict();

export type CreatePollRequest = z.infer<typeof pollSchema>;
export type CreatePollResponse = ApiResponse & {
  poll?: Poll;
  validation?: any;
};

export async function POST(request: NextRequest): Promise<NextResponse<CreatePollResponse>> {
  const inputPoll = await request.json();
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  // Validate poll according to schema
  const validatedPoll = pollSchema.safeParse(inputPoll);
  if (!validatedPoll.success) {
    console.warn("Poll Input is invalid", validatedPoll.error);
    return NextResponse.json(
      {
        error: true,
        message: "Request is invalid.",
        validation: validatedPoll.error,
      },
      { status: 400 },
    );
  }

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

  // Create poll
  const { data, error } = await supabase
    .from("polls")
    .insert([
      {
        ...validatedPoll.data,
        user_id: user?.id,
      },
    ])
    .select();

  if (!data || error) {
    console.error("Error during poll creation:", data, error);
    return NextResponse.json(
      {
        error: true,
        message: error ? error.message : "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({ message: "Poll created.", poll: data[0] });
}
