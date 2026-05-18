import { NextResponse } from "next/server";
import { createCheckoutSession } from "@/lib/api";

export async function POST(request: Request) {
  const { plan } = await request.json();
  if (plan !== "pro" && plan !== "premium") {
    return NextResponse.json({ message: "Free plan does not use checkout" }, { status: 400 });
  }
  try {
    return NextResponse.json(await createCheckoutSession(plan));
  } catch {
    return NextResponse.json({ message: "Unable to open checkout" }, { status: 500 });
  }
}
