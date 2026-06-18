"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Cloud, RefreshCw, AlertCircle } from "lucide-react";
import Dropzone from "@/components/Dropzone";
import RecentFiles from "@/components/RecentFiles";
import FileList from "@/components/FileList";
import styles from "./page.module.css";

interface S3File {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
}

export default function Home() {
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/files");
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setFiles(data);
    } catch (err: any) {
      console.error("Error fetching files:", err);
      setError(err.message || "Error al conectar con la API de archivos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <main className={styles.main}>
      {/* Visual background glow blobs for premium glassmorphism aesthetic */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logoWrapper}>
            <Cloud className={styles.logo} />
            <h1 className={styles.title}>Drive Clon</h1>
          </div>
          <p className={styles.subtitle}>
            Almacenamiento simple, rápido y local respaldado por S3
          </p>
        </header>

        <section className={styles.uploadSection}>
          <Dropzone onUploadComplete={fetchFiles} />
        </section>

        {loading && files.length === 0 ? (
          <div className={styles.statusContainer}>
            <RefreshCw className={`${styles.statusIcon} ${styles.spin}`} />
            <p>Cargando tus archivos desde S3...</p>
          </div>
        ) : error ? (
          <div className={`${styles.statusContainer} ${styles.errorContainer}`}>
            <AlertCircle className={styles.statusIcon} />
            <p>{error}</p>
            <button onClick={fetchFiles} className={styles.retryBtn}>
              Reintentar
            </button>
          </div>
        ) : (
          <div className={styles.dashboardLayout}>
            <RecentFiles files={files} />
            <FileList files={files} />
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Drive Clon - Desarrollado con Next.js y LocalStack S3</p>
      </footer>
    </main>
  );
}
