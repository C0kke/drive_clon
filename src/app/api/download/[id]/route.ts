import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing file ID" }, { status: 400 });
    }

    let fileMeta: any = null;
    try {
      const getMetaCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: "metadata.json",
      });
      const metaResponse = await s3Client.send(getMetaCommand);
      const metaData = await metaResponse.Body?.transformToString();
      const files = JSON.parse(metaData || "[]");
      fileMeta = files.find((f: any) => f.id === id);
    } catch (metaError: any) {
      if (metaError.name !== "NoSuchKey") {
        throw metaError;
      }
    }

    if (!fileMeta) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // 2. Fetch the file stream from S3
    const getFileCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: `files/${id}`,
    });

    const fileResponse = await s3Client.send(getFileCommand);

    if (!fileResponse.Body) {
      return NextResponse.json({ error: "File content is empty" }, { status: 404 });
    }

    // Convert the S3 Node stream to a Web ReadableStream which NextResponse accepts
    const webStream = fileResponse.Body.transformToWebStream();

    // 3. Return the stream with content disposition header for downloading
    const headers = new Headers();
    headers.set("Content-Type", fileMeta.mimeType || "application/octet-stream");
    // Standard and modern way to handle file names with spaces and special characters
    headers.set(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(fileMeta.originalName)}`
    );

    return new NextResponse(webStream, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Error downloading file from S3:", error);
    return NextResponse.json(
      { error: "Failed to download file: " + error.message },
      { status: 500 }
    );
  }
}
