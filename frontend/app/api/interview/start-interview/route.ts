import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBackendBaseUrl } from "@/lib/env";

const BACKEND_API_URL = getBackendBaseUrl();

export async function POST(request: Request) {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();

  const upstream = await fetch(`${BACKEND_API_URL}/interview/start-interview`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const contentType = upstream.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await upstream.json()
    : await upstream.text();

  return NextResponse.json(body, { status: upstream.status });
}

