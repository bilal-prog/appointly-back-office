import { NextResponse } from "next/server";
import { flagReview } from "@/lib/api";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const { reviewId } = await params;
    return NextResponse.json(await flagReview(reviewId));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to flag review";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
