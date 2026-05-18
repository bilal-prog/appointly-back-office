import { NextResponse } from "next/server";
import { getBusinessDashboard } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json(await getBusinessDashboard());
  } catch {
    return NextResponse.json({ message: "Unable to load dashboard" }, { status: 500 });
  }
}
