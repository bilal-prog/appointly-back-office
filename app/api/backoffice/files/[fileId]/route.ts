import { NextResponse } from "next/server";
import { deleteFile } from "@/lib/api";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    const { fileId } = await params;
    const data = await deleteFile(fileId);
    return NextResponse.json(data);
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to delete file";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
