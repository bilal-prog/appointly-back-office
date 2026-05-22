import { NextResponse } from "next/server";
import { deleteService, updateService } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  try {
    const { serviceId } = await params;
    const body = await request.json();
    return NextResponse.json(await updateService(body, serviceId));
  } catch (error: any) {
    console.error("Error updating service:", error);
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to save service";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ serviceId: string }> },
) {
  try {
    const { serviceId } = await params;
    return NextResponse.json(await deleteService(serviceId));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to delete service";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
