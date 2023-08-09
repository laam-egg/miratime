import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();
    return NextResponse.json({
        email2: email, password2: password
    });
}
