import { NextResponse } from "next/server";
import { uploadFiles } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const backendFormData = new FormData();
    const files = formData.getAll("files");

    for (const file of files) {
      backendFormData.append("files", file);
    }

    const data = await uploadFiles(backendFormData);
    return NextResponse.json(data);
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to upload files";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
