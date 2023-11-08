import { createServiceClient } from "@/app/api/supabase.ts";
import { ApiResponse, Poll } from "@/types/common";
import { Database } from "@/types/database";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

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

const supabaseServiceClient = createServiceClient();

export type CreatePollRequest = z.infer<typeof pollSchema>;

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Poll>>> {
  const inputPoll = await request.json();
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  // Validate poll according to schema
  const validatedPoll = pollSchema.safeParse(inputPoll);
  if (!validatedPoll.success) {
    console.warn("Poll Input is invalid", validatedPoll.error);
    return NextResponse.json(
      {
        success: false,
        error: "Request is invalid.",
        details: fromZodError(validatedPoll.error).message,
      },
      { status: 400 },
    );
  }

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

  // Create poll
  const { data, error } = await supabaseServiceClient
    .from("polls")
    .insert([
      {
        ...validatedPoll.data,
        user_id: session?.user.id,
      },
    ])
    .select();

  if (!data || error) {
    console.error("Error during poll creation:", data, error);
    return NextResponse.json(
      {
        success: false,
        error: error ? error.message : "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({ success: true, message: "Poll created.", data: data[0] });
}
