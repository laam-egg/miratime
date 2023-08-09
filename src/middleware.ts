import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const user: User = {
        id: "1",
        fullName: "2"
    };
    console.log(user);
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/"
    ]
}
