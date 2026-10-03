import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Server-side password verification
    // projectxtool
    if (password === 'projectxtool') {
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
