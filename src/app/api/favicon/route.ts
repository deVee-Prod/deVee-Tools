import { NextResponse } from "next/server"
import { readFileSync } from "fs"
import { join } from "path"

export async function GET() {
  const file = readFileSync(join(process.cwd(), "public", "devee-icon-2026.png"))
  return new NextResponse(file, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  })
}