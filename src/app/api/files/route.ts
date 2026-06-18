import { NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function GET() {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: "metadata.json",
    });

    const response = await s3Client.send(command);
    const data = await response.Body?.transformToString();
    const files = JSON.parse(data || "[]");

    files.sort((a: any, b: any) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

    return NextResponse.json(files);
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      return NextResponse.json([]);
    }
    console.error("Error fetching files list:", error);
    return NextResponse.json(
      { error: "Failed to fetch files from S3: " + error.message },
      { status: 500 }
    );
  }
}
