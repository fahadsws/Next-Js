import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/'

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}


export const config = {
  matcher: [
    '/create/:path*',
    '/tools',
    '/login',
    '/register',
  ]
} 