import { NextResponse } from "next/server";
import { deleteAppointment, updateAppointmentStatus } from "@/lib/api";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  try {
    const { appointmentId } = await params;
    const body = await request.json();
    return NextResponse.json(
      await updateAppointmentStatus(appointmentId, body.status),
    );
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to update appointment status";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ appointmentId: string }> },
) {
  try {
    const { appointmentId } = await params;
    return NextResponse.json(await deleteAppointment(appointmentId));
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to delete appointment";
    return NextResponse.json(
      { message },
      { status: error.response?.status || 500 },
    );
  }
}
