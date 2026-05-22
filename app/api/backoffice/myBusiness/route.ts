import { NextResponse } from "next/server";
import { getMyBusiness } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json(await getMyBusiness());
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get business";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
