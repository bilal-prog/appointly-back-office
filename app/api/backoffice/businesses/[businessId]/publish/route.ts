import { NextResponse } from "next/server";
import { publishBusiness } from "@/lib/api";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId } = await params;
    return NextResponse.json(await publishBusiness(businessId));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to publish business";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
