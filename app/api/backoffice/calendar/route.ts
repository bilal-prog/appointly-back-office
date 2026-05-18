import { NextResponse } from "next/server";
import { getBusinessCalendar } from "@/lib/api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  if (!startDate || !endDate) {
    return NextResponse.json({ message: "Missing date range" }, { status: 400 });
  }
  try {
    return NextResponse.json(await getBusinessCalendar(startDate, endDate));
  } catch {
    return NextResponse.json({ message: "Unable to load calendar" }, { status: 500 });
  }
}
