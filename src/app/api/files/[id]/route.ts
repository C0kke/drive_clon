import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET_NAME } from "@/lib/s3";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing file/folder ID" }, { status: 400 });
    }

    let files: any[] = [];
    try {
      const getMetaCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: "metadata.json",
      });
      const metaResponse = await s3Client.send(getMetaCommand);
      const metaData = await metaResponse.Body?.transformToString();
      files = JSON.parse(metaData || "[]");
    } catch (metaError: any) {
      if (metaError.name === "NoSuchKey") {
        return NextResponse.json({ error: "No files found to delete" }, { status: 404 });
      }
      throw metaError;
    }

    const targetItem = files.find((f: any) => f.id === id);
    if (!targetItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    let itemsToDelete: any[] = [];
    let updatedFiles: any[] = [];

    if (targetItem.isFolder) {
      const folderPathPrefix = (targetItem.path || "/") + targetItem.originalName + "/";

      files.forEach((file: any) => {
        const isSelf = file.id === targetItem.id;
        const isDescendant = file.path && file.path.startsWith(folderPathPrefix);

        if (isSelf || isDescendant) {
          itemsToDelete.push(file);
        } else {
          updatedFiles.push(file);
        }
      });
    } else {
      files.forEach((file: any) => {
        if (file.id === targetItem.id) {
          itemsToDelete.push(file);
        } else {
          updatedFiles.push(file);
        }
      });
    }

    for (const item of itemsToDelete) {
      if (!item.isFolder) {
        try {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: `files/${item.id}`,
          });
          await s3Client.send(deleteCommand);
        } catch (s3Error) {
          console.error(`Failed to delete physical file ${item.id} from S3:`, s3Error);
        }
      }
    }

    const putMetaCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: "metadata.json",
      Body: JSON.stringify(updatedFiles, null, 2),
      ContentType: "application/json",
    });
    await s3Client.send(putMetaCommand);

    return NextResponse.json({ success: true, deletedCount: itemsToDelete.length });
  } catch (error: any) {
    console.error("Error deleting file/folder from S3:", error);
    return NextResponse.json(
      { error: "Failed to delete: " + error.message },
      { status: 500 }
    );
  }
}
