import { NextResponse } from "next/server";
import { getAppointments } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json(await getAppointments(params));
  } catch (error: any) {
    console.log("appointments error:", error);
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get appointments";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
