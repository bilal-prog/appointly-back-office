import { NextResponse } from "next/server";
import { getCustomers } from "@/lib/api";

export async function GET() {
  return NextResponse.json(await getCustomers());
}
