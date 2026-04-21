export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    // Protect everything except login, the NextAuth endpoints, the webhook, and static assets
    '/((?!api/webhooks|api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
};
