import { NextResponse } from "next/server";
import { getNotifications, sendMarketingNotification } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json(await getNotifications(params));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get notifications";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(
      await sendMarketingNotification(await request.json()),
    );
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to send marketing notification";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
