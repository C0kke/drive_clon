"use client";

import React, { useState } from "react";
import { Search, Download, FileText, Video, Image as ImageIcon, FileArchive, FileCode, File, Calendar } from "lucide-react";
import { formatBytes } from "./RecentFiles";
import styles from "./FileList.module.css";

interface S3File {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
}

interface FileListProps {
  files: S3File[];
}

export default function FileList({ files }: FileListProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const filteredFiles = files.filter((file) =>
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (files.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <p>No hay archivos en tu unidad. ¡Arrastra uno arriba para comenzar!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Todos los archivos</h2>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.tableWrapper}>
        {filteredFiles.length === 0 ? (
          <div className={styles.noResults}>
            <p>No se encontraron archivos que coincidan con &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha de subida</th>
                <th>Tamaño</th>
                <th className={styles.actionCol}>Descargar</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className={styles.row}>
                  <td className={styles.nameCell}>
                    <div className={styles.fileInfoWrapper}>
                      {getFileIcon(file.mimeType)}
                      <span className={styles.fileName} title={file.originalName}>
                        {file.originalName}
                      </span>
                    </div>
                  </td>
                  <td className={styles.dateCell}>
                    <div className={styles.dateInfo}>
                      <Calendar className={styles.calendarIcon} />
                      <span>{formatDate(file.uploadDate)}</span>
                    </div>
                  </td>
                  <td>{formatBytes(file.size)}</td>
                  <td className={styles.actionCell}>
                    <a
                      href={`/api/download/${file.id}`}
                      download={file.originalName}
                      className={styles.downloadBtn}
                      title="Descargar archivo"
                    >
                      <Download className={styles.downloadIcon} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
