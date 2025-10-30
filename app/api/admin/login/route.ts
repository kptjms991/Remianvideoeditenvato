import { type NextRequest, NextResponse } from "next/server"

// Admin credentials (in production, use a database with hashed passwords)
const ADMIN_EMAIL = "kptjms991@gmail.com"
const ADMIN_PASSWORD = "remiantjms8567"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate credentials
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate a simple token (in production, use JWT)
      const token = Buffer.from(`${email}:${Date.now()}`).toString("base64")

      return NextResponse.json(
        {
          success: true,
          token,
          email,
          role: "admin",
        },
        { status: 200 },
      )
    }

    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
