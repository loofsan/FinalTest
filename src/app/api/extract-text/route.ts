import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "A 'file' field with a PDF is required" },
        { status: 400 }
      );
    }

    const filename = (file as File).name || "upload.pdf";
    const contentType = (file as File).type || "";

    const isPdf = contentType === "application/pdf" || /\.pdf$/i.test(filename);
    if (!isPdf) {
      return NextResponse.json(
        { error: "Only PDF files are supported in Phase 3" },
        { status: 415 }
      );
    }

    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await pdfParse(buffer);
    const text = result.text || "";
    const pages = (result as any).numpages ?? (result as any).info?.Pages ?? 0;

    return NextResponse.json({
      text,
      meta: {
        pages,
        chars: text.length,
      },
    });
  } catch (error) {
    console.error("Error in extract-text API route:", error);
    return NextResponse.json(
      { error: "Failed to extract text from document" },
      { status: 500 }
    );
  }
}
