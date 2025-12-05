import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect /builder route
        if (req.nextUrl.pathname.startsWith("/builder")) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/builder/:path*"],
}

