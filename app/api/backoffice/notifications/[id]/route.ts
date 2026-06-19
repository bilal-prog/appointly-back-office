import { NextResponse } from "next/server";
import { deleteNotification } from "@/lib/api";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    return NextResponse.json(await deleteNotification(id));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to delete notification";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
