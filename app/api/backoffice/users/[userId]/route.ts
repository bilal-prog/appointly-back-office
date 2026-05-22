import { NextResponse } from "next/server";
import { deleteUser, updateUser } from "@/lib/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    return NextResponse.json(await updateUser(userId, await request.json()));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to update user";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    return NextResponse.json(await deleteUser(userId));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to delete user";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
