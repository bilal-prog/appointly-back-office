import { NextResponse } from "next/server";
import { forgotPassword } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const response = await forgotPassword(email);
    return NextResponse.json(response);
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to process forgot password request";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
