import { NextResponse } from "next/server";
import { createBusiness } from "@/lib/api";

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createBusiness(await request.json()));
  } catch {
    return NextResponse.json({ message: "Unable to save business" }, { status: 500 });
  }
}
