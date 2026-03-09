import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher(["/", "/login(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    // Allow public routes through
    if (isPublicRoute(req)) return NextResponse.next();

    // For dashboard routes: require Clerk auth
    const { userId } = await auth();
    if (!userId) {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
