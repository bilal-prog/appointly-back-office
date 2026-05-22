import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieNames, getCurrentUser } from "@/lib/api";

export async function GET() {
  const token = (await cookies()).get(cookieNames.token)?.value;
  const url = process.env.NEXT_PUBLIC_API_URL;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!url) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 },
    );
  }

  try {
    return NextResponse.json({ token, url, user: await getCurrentUser() });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to refresh user";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
