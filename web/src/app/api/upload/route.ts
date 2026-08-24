import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

// Загрузка изображений с диска (хранятся в public/uploads).

const MAX_SIZE = 5 * 1024 * 1024; // 5 МБ

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
  }
  if (!EXT[file.type]) {
    return NextResponse.json(
      { error: "Допустимы только изображения (JPG, PNG, WEBP, GIF, SVG)" },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "Файл слишком большой (макс. 5 МБ)" },
      { status: 400 },
    );
  }

  const ext = EXT[file.type];
  const name = `${crypto.randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(dir, name), bytes);

  return NextResponse.json({ url: `/uploads/${name}` });
}
