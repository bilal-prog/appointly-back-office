import { NextResponse } from "next/server";
import { updateBusiness } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId } = await params;
    const body = await request.json();
    return NextResponse.json(await updateBusiness(body, businessId));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to save business";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
