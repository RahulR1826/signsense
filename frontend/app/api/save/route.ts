import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { label, data } = body;

    const dir = path.join(process.cwd(), "dataset", label);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filePath = path.join(dir, `${Date.now()}.json`);

    fs.writeFileSync(filePath, JSON.stringify({ label, data }));

    return NextResponse.json({ success: true }); // ✅ important
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}