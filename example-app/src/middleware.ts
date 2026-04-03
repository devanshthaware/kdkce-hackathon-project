import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

// Apply middleware to all app routes except Next.js internals/static assets.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
