import { NextResponse } from "next/server";
import { getServices } from "@/lib/api";

export async function GET() {
  return NextResponse.json(await getServices());
}
