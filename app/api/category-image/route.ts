import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const PRODUCT_DIR = "D:\\3 Layered Resources\\products";

function contentTypeForExt(ext: string): string {
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const indexParam = url.searchParams.get("index") ?? "0";
    let index = Number.parseInt(indexParam, 10);
    if (!Number.isFinite(index) || index < 0) index = 0;

    const entries = await fs.readdir(PRODUCT_DIR, { withFileTypes: true });
    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter((n) => /\.(png|jpg|jpeg|webp|svg)$/i.test(n))
      .sort();

    if (files.length === 0) {
      return NextResponse.json({ error: "No images found in products folder." }, { status: 404 });
    }

    const fileName = files[Math.min(index, files.length - 1)];
    const filePath = path.join(PRODUCT_DIR, fileName);
    const data = await fs.readFile(filePath);
    const type = contentTypeForExt(path.extname(fileName).toLowerCase());

    return new NextResponse(data, {
      headers: {
        "content-type": type,
        "cache-control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Unable to read images", detail: String(err?.message ?? err) }, { status: 500 });
  }
}

