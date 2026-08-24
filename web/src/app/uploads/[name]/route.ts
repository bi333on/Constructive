import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { mimeFor, uploadsDir } from "@/lib/uploads";

export const dynamic = "force-dynamic";

// Отдача загруженных изображений из папки данных.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const safeName = path.basename(name);
  const filePath = path.join(uploadsDir(), safeName);

  if (!fs.existsSync(filePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const data = fs.readFileSync(filePath);
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "Content-Type": mimeFor(safeName),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
