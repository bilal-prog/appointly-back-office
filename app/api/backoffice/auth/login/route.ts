import { NextResponse } from "next/server";
import { login, setAuthCookies } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await login(body);
    await setAuthCookies(response);
    return NextResponse.json({ user: response.user });
  } catch {
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 });
  }
}
