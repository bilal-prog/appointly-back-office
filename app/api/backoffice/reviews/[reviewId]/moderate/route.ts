import { NextResponse } from "next/server";
import { moderateReview } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const { reviewId } = await params;
    const { status } = await request.json();
    return NextResponse.json(await moderateReview(reviewId, status));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to moderate review";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
