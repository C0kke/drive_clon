"use client";

import React from "react";
import { Download, FileText, Video, Image as ImageIcon, FileArchive, FileCode, File } from "lucide-react";
import styles from "./RecentFiles.module.css";

interface S3File {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  isFolder?: boolean;
}

interface RecentFilesProps {
  files: S3File[];
}

export function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export default function RecentFiles({ files }: RecentFilesProps) {
  // Filter out folders, only display files
  const recent = files.filter((file) => !file.isFolder).slice(0, 3);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className={styles.fileIcon} />;
    if (mimeType.startsWith("video/")) return <Video className={styles.fileIcon} />;
    if (mimeType === "application/pdf") return <FileText className={styles.fileIcon} />;
    if (
      mimeType.includes("zip") ||
      mimeType.includes("tar") ||
      mimeType.includes("rar") ||
      mimeType.includes("gzip")
    ) {
      return <FileArchive className={styles.fileIcon} />;
    }
    if (
      mimeType.includes("javascript") ||
      mimeType.includes("typescript") ||
      mimeType.includes("html") ||
      mimeType.includes("css") ||
      mimeType.includes("json")
    ) {
      return <FileCode className={styles.fileIcon} />;
    }
    return <File className={styles.fileIcon} />;
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");
  const isVideo = (mimeType: string) => mimeType.startsWith("video/");

  if (recent.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p className={styles.emptyText}>No hay archivos subidos recientemente.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Archivos Recientes</h2>
      <div className={styles.grid}>
        {recent.map((file) => (
          <div key={file.id} className={styles.card}>
            <div className={styles.previewContainer}>
              {isImage(file.mimeType) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/download/${file.id}`}
                  alt={file.originalName}
                  className={styles.imagePreview}
                  loading="lazy"
                />
              ) : isVideo(file.mimeType) ? (
                <div className={styles.videoPlaceholder}>
                  <Video className={styles.previewIcon} />
                  <span className={styles.mediaLabel}>Video</span>
                </div>
              ) : (
                <div className={styles.docPlaceholder}>
                  {getFileIcon(file.mimeType)}
                  <span className={styles.extensionLabel}>
                    {file.originalName.split(".").pop()?.toUpperCase() || "DOC"}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.cardDetails}>
              <div className={styles.metaInfo}>
                <h3 className={styles.fileName} title={file.originalName}>
                  {file.originalName}
                </h3>
                <span className={styles.fileSize}>{formatBytes(file.size)}</span>
              </div>
              
              <a
                href={`/api/download/${file.id}`}
                download={file.originalName}
                className={styles.downloadBtn}
                title="Descargar archivo"
              >
                <Download className={styles.downloadIcon} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
