import { NextResponse } from "next/server";
import { register, setAuthCookies } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await register(body);
    await setAuthCookies(response);
    return NextResponse.json({ user: response.user });
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Registration failed";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 400 },
    );
  }
}
