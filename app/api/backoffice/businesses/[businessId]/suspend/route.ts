import { NextResponse } from "next/server";
import { suspendBusiness } from "@/lib/api";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ businessId: string }> },
) {
  try {
    const { businessId } = await params;
    return NextResponse.json(await suspendBusiness(businessId));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to suspend business";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
