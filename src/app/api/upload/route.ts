import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const isFolder = formData.get("isFolder") === "true";
    const path = (formData.get("path") as string) || "/";

    let newFileMetadata: any = null;

    if (isFolder) {
      const name = formData.get("name") as string;
      if (!name) {
        return NextResponse.json({ error: "No folder name provided" }, { status: 400 });
      }

      const id = `folder-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      newFileMetadata = {
        id,
        originalName: name,
        mimeType: "application/x-directory",
        size: 0,
        uploadDate: new Date().toISOString(),
        isFolder: true,
        path,
      };
    } else {
      const file = formData.get("file") as File;

      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const s3Key = `files/${id}`;

      // 1. Upload the file to S3
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      });
      await s3Client.send(uploadCommand);

      newFileMetadata = {
        id,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        uploadDate: new Date().toISOString(),
        path,
      };
    }

    // 2. Read the existing metadata.json from S3
    let existingFiles = [];
    try {
      const getMetaCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: "metadata.json",
      });
      const metaResponse = await s3Client.send(getMetaCommand);
      const metaData = await metaResponse.Body?.transformToString();
      existingFiles = JSON.parse(metaData || "[]");
    } catch (metaError: any) {
      // If metadata.json doesn't exist, we start with an empty array
      if (metaError.name !== "NoSuchKey") {
        throw metaError;
      }
    }

    // 3. Append new file/folder metadata
    existingFiles.push(newFileMetadata);

    // 4. Write the updated metadata back to S3
    const putMetaCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: "metadata.json",
      Body: JSON.stringify(existingFiles, null, 2),
      ContentType: "application/json",
    });
    await s3Client.send(putMetaCommand);

    return NextResponse.json({ success: true, file: newFileMetadata });
  } catch (error: any) {
    console.error("Error uploading file/folder to S3:", error);
    return NextResponse.json(
      { error: "Failed to upload or create folder: " + error.message },
      { status: 500 }
    );
  }
}
