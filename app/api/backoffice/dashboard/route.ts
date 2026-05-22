import { NextResponse } from "next/server";
import { getBusinessDashboard } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json(await getBusinessDashboard());
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to load dashboard";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
