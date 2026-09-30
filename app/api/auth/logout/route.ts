import { NextResponse } from "next/server";
import { getAdminCookieOptions } from "@/lib/auth";

export async function POST() {
  const cookieOptions = getAdminCookieOptions();
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set(cookieOptions.name, "", {
    httpOnly: true,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: "/",
    maxAge: 0,
  });
  return response;
}
