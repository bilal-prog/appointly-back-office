import { NextResponse } from "next/server";
import { markAsRead } from "@/lib/api";

export async function PATCH(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    return NextResponse.json(await markAsRead(body.notificationId));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to mark notification as read";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
