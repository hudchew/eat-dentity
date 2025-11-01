import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk', // Webhook endpoint (no auth needed)
  '/manifest.json', // PWA manifest (no auth needed)
  '/icons(.*)', // PWA icons (no auth needed)
  '/admin(.*)', // Admin routes - handled separately by admin middleware
  '/api/admin(.*)', // Admin API routes - handled separately
]);

export default clerkMiddleware(async (auth, request) => {
  // Skip admin routes - they have their own authentication
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin')) {
    return;
  }

  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    const { userId } = await auth();
    
    // If not authenticated, redirect to custom sign-in page
    if (!userId) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect_url', request.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

