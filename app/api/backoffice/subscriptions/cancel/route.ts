import { NextResponse } from "next/server";
import { cancelSubscription } from "@/lib/api";

export async function POST() {
  try {
    return NextResponse.json(await cancelSubscription());
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to cancel subscription";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
