import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const response = await resetPassword(currentPassword, newPassword);
    return NextResponse.json(response);
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to process reset password request";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
