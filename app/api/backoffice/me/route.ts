import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/api";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user });
}
