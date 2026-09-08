import { NextResponse, type NextRequest } from "next/server";

export function proxy(_request: NextRequest) {
  // Auth guard disabled for frontend/demo mode
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
