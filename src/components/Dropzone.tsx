"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import styles from "./Dropzone.module.css";

interface DropzoneProps {
  onUploadComplete: () => void;
}

export default function Dropzone({ onUploadComplete }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<{
    status: "idle" | "uploading" | "success" | "error";
    currentFile: string;
    progress: number;
    totalFiles: number;
    currentIndex: number;
    errorMsg?: string;
  }>({
    status: "idle",
    currentFile: "",
    progress: 0,
    totalFiles: 0,
    currentIndex: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const onDropzoneClick = () => {
    if (uploadState.status !== "uploading") {
      fileInputRef.current?.click();
    }
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadState({
      status: "uploading",
      currentFile: "",
      progress: 0,
      totalFiles: files.length,
      currentIndex: 0,
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadState((prev) => ({
        ...prev,
        currentFile: file.name,
        currentIndex: i + 1,
        progress: 0,
      }));

      try {
        await uploadSingleFile(file);
      } catch (err: any) {
        setUploadState({
          status: "error",
          currentFile: file.name,
          progress: 0,
          totalFiles: files.length,
          currentIndex: i + 1,
          errorMsg: err.message || "Error al subir el archivo",
        });
        // Stop sequential uploading on error
        return;
      }
    }

    // Success state
    setUploadState((prev) => ({
      ...prev,
      status: "success",
      progress: 100,
    }));

    // Trigger update in parent
    onUploadComplete();

    // Reset back to idle after 2.5 seconds
    setTimeout(() => {
      setUploadState({
        status: "idle",
        currentFile: "",
        progress: 0,
        totalFiles: 0,
        currentIndex: 0,
      });
    }, 2500);
  };

  const uploadSingleFile = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);

      // Track progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadState((prev) => ({
            ...prev,
            progress: percentComplete,
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          try {
            const response = JSON.parse(xhr.responseText);
            reject(new Error(response.error || `Error: ${xhr.statusText}`));
          } catch {
            reject(new Error(`Error de red o servidor: ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Error de conexión con el servidor"));
      };

      xhr.send(formData);
    });
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${isDragActive ? styles.active : ""} ${
          uploadState.status === "uploading" ? styles.uploading : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={onDropzoneClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className={styles.fileInput}
          multiple
          disabled={uploadState.status === "uploading"}
        />

        {uploadState.status === "idle" && (
          <div className={styles.content}>
            <div className={styles.iconWrapper}>
              <UploadCloud className={styles.icon} />
            </div>
            <h3>Arrastra y suelta tus archivos aquí</h3>
            <p className={styles.subtext}>o haz clic para explorar en tu equipo</p>
            <span className={styles.hint}>Soporta documentos, imágenes y videos</span>
          </div>
        )}

        {uploadState.status === "uploading" && (
          <div className={styles.content}>
            <div className={styles.loaderWrapper}>
              <Loader2 className={styles.spinner} />
            </div>
            <h3>
              Subiendo archivo {uploadState.currentIndex} de {uploadState.totalFiles}
            </h3>
            <p className={styles.filename} title={uploadState.currentFile}>
              {uploadState.currentFile}
            </p>
            <div className={styles.progressContainer}>
              <div
                className={styles.progressBar}
                style={{ width: `${uploadState.progress}%` }}
              ></div>
            </div>
            <span className={styles.progressText}>{uploadState.progress}%</span>
          </div>
        )}

        {uploadState.status === "success" && (
          <div className={styles.content}>
            <div className={`${styles.iconWrapper} ${styles.successIcon}`}>
              <CheckCircle2 className={styles.icon} />
            </div>
            <h3>¡Subida completada con éxito!</h3>
            <p className={styles.subtext}>Actualizando tu clon de drive...</p>
          </div>
        )}

        {uploadState.status === "error" && (
          <div className={styles.content}>
            <div className={`${styles.iconWrapper} ${styles.errorIcon}`}>
              <XCircle className={styles.icon} />
            </div>
            <h3>Error al subir archivos</h3>
            <p className={styles.errorMessage}>{uploadState.errorMsg}</p>
            <p className={styles.subtextClick}>Haz clic para intentar de nuevo</p>
          </div>
        )}
      </div>
    </div>
  );
}
