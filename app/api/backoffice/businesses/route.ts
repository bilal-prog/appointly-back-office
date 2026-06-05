import { NextResponse } from "next/server";
import { createBusiness, getBusinesses } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json(await getBusinesses(params));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get businesses";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createBusiness(await request.json()));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to create business";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
