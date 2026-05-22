import { NextResponse } from "next/server";
import { createUser, getUsers } from "@/lib/api";

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    return NextResponse.json(await getUsers(params));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to get users";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createUser(await request.json()));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to create user";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
