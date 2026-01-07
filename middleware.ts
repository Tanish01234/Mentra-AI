import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Only enforce auth if Supabase is properly configured
  if (supabaseUrl && supabaseAnonKey && 
      supabaseUrl !== 'your_supabase_url_here' && 
      supabaseUrl.trim() !== '' &&
      supabaseUrl.startsWith('http')) {
    try {
      const supabase = createMiddlewareClient({ req, res })
      
      // Refresh session if expired
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Protect dashboard routes
      if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
        const redirectUrl = new URL('/auth/login', req.url)
        // Preserve the intended destination
        redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
        return NextResponse.redirect(redirectUrl)
      }

      // Redirect authenticated users away from auth pages (except callback)
      if (req.nextUrl.pathname.startsWith('/auth') && 
          !req.nextUrl.pathname.startsWith('/auth/callback') &&
          session) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    } catch (error) {
      // If Supabase middleware fails, allow access (for demo purposes)
      console.warn('Supabase middleware error, allowing access:', error)
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/login',
    '/auth/signup',
    '/auth/callback',
  ],
}
