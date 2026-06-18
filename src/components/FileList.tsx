"use client";

import React from "react";
import { Folder, ChevronRight, Download, FileText, Video, Image as ImageIcon, FileArchive, FileCode, File, Calendar, ExternalLink } from "lucide-react";
import { formatBytes } from "./RecentFiles";
import styles from "./FileList.module.css";

interface S3File {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  isFolder?: boolean;
  path?: string;
}

interface FileListProps {
  files: S3File[];
  currentPath: string;
  onPathChange: (path: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export default function FileList({
  files,
  currentPath,
  onPathChange,
  searchQuery,
}: FileListProps) {

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

  const isSearching = searchQuery.trim() !== "";

  // Filter items
  const displayItems = files.filter((file) => {
    if (isSearching) {
      return file.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return (file.path || "/") === currentPath;
    }
  });

  // Sort: folders first, then files
  const displayFolders = displayItems.filter((f) => f.isFolder);
  const displayFiles = displayItems.filter((f) => !f.isFolder);

  // Click on a breadcrumb item
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      onPathChange("/");
      return;
    }
    const segments = currentPath.split("/").filter(Boolean);
    const targetSegments = segments.slice(0, index + 1);
    const targetPath = "/" + targetSegments.join("/") + "/";
    onPathChange(targetPath);
  };

  // Get Breadcrumbs array
  const breadcrumbs = currentPath.split("/").filter(Boolean);

  const handleFolderClick = (folder: S3File) => {
    const parentPath = folder.path || "/";
    const newPath = parentPath + folder.originalName + "/";
    onPathChange(newPath);
  };

  const getFolderNameDisplay = (pathStr: string) => {
    if (pathStr === "/") return "Mi unidad";
    const segments = pathStr.split("/").filter(Boolean);
    return segments[segments.length - 1] || "Mi unidad";
  };

  if (files.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Folder className={styles.emptyIcon} />
        <p>No hay archivos en tu unidad. ¡Sube un archivo o crea una carpeta para comenzar!</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Folder Breadcrumbs and Search Results Header */}
      <div className={styles.navigationHeader}>
        {isSearching ? (
          <div className={styles.breadcrumbs}>
            <span className={styles.breadcrumbItemActive}>Resultados de búsqueda para &quot;{searchQuery}&quot;</span>
          </div>
        ) : (
          <div className={styles.breadcrumbs}>
            <span
              className={currentPath === "/" ? styles.breadcrumbItemActive : styles.breadcrumbItem}
              onClick={() => handleBreadcrumbClick(-1)}
            >
              Mi unidad
            </span>
            {breadcrumbs.map((segment, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className={styles.breadcrumbSeparator} />
                <span
                  className={idx === breadcrumbs.length - 1 ? styles.breadcrumbItemActive : styles.breadcrumbItem}
                  onClick={() => handleBreadcrumbClick(idx)}
                >
                  {segment}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Folders Section */}
      {displayFolders.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Carpetas</h3>
          <div className={styles.folderGrid}>
            {displayFolders.map((folder) => (
              <div
                key={folder.id}
                className={styles.folderCard}
                onClick={() => handleFolderClick(folder)}
                title={`Abrir carpeta ${folder.originalName}`}
              >
                <Folder className={styles.folderCardIcon} />
                <span className={styles.folderCardName}>{folder.originalName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className={styles.section}>
        {!isSearching && displayFolders.length > 0 && displayFiles.length > 0 && (
          <h3 className={styles.sectionTitle}>Archivos</h3>
        )}

        {displayFiles.length === 0 ? (
          // Empty folder or search state
          displayFolders.length === 0 && (
            <div className={styles.emptyFolderState}>
              <Folder className={styles.emptyStateIcon} />
              <p>
                {isSearching
                  ? `No se encontraron resultados para "${searchQuery}"`
                  : "Esta carpeta está vacía"}
              </p>
            </div>
          )
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  {isSearching && <th>Ubicación</th>}
                  <th>Fecha de subida</th>
                  <th>Tamaño</th>
                  <th className={styles.actionCol}>Descargar</th>
                </tr>
              </thead>
              <tbody>
                {displayFiles.map((file) => (
                  <tr key={file.id} className={styles.row}>
                    <td className={styles.nameCell}>
                      <div className={styles.fileInfoWrapper}>
                        {getFileIcon(file.mimeType)}
                        <span className={styles.fileName} title={file.originalName}>
                          {file.originalName}
                        </span>
                      </div>
                    </td>
                    {isSearching && (
                      <td className={styles.pathCell}>
                        <div
                          className={styles.pathLink}
                          onClick={() => onPathChange(file.path || "/")}
                          title={`Ir a la carpeta ${getFolderNameDisplay(file.path || "/")}`}
                        >
                          <ExternalLink className={styles.pathLinkIcon} />
                          <span>{getFolderNameDisplay(file.path || "/")}</span>
                        </div>
                      </td>
                    )}
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
          </div>
        )}
      </div>
    </div>
  );
}
