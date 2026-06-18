"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Cloud, RefreshCw, AlertCircle, Menu, Plus, FolderPlus, FileUp, Home as HomeIcon, HardDrive, Search, X } from "lucide-react";
import Dropzone, { DropzoneRef } from "@/components/Dropzone";
import RecentFiles from "@/components/RecentFiles";
import FileList from "@/components/FileList";
import styles from "./page.module.css";

interface S3File {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  isFolder?: boolean;
  path?: string;
}

export default function HomePage() {
  const [files, setFiles] = useState<S3File[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"inicio" | "files">("files");
  const [currentPath, setCurrentPath] = useState("/");
  const [searchQuery, setSearchQuery] = useState("");

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploadingFolder, setIsUploadingFolder] = useState(false);

  const dropzoneRef = useRef<DropzoneRef>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setIsUploadingFolder(true);
    try {
      const formData = new FormData();
      formData.append("isFolder", "true");
      formData.append("name", newFolderName.trim());
      formData.append("path", currentPath);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || "Error al crear la carpeta");
      }

      setNewFolderName("");
      setIsCreateFolderModalOpen(false);
      await fetchFiles();
    } catch (err: any) {
      alert(err.message || "Error al crear la carpeta");
    } finally {
      setIsUploadingFolder(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const triggerFileUpload = () => {
    setIsDropdownOpen(false);
    dropzoneRef.current?.openFileDialog();
  };

  const openFolderModal = () => {
    setIsDropdownOpen(false);
    setIsCreateFolderModalOpen(true);
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.menuBtn} onClick={toggleSidebar} title="Menú lateral">
            <Menu className={styles.menuIcon} />
          </button>
          <div className={styles.logoWrapper}>
            <Cloud className={styles.logo} />
            <h1 className={styles.title}>Drive Clon</h1>
          </div>
        </div>

        <div className={styles.headerCenter}>
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar en Drive Clon..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() !== "" && activeTab !== "files") {
                  setActiveTab("files");
                }
              }}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button className={styles.clearSearchBtn} onClick={() => setSearchQuery("")}>
                <X className={styles.clearSearchIcon} />
              </button>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.avatar}>DC</div>
        </div>
      </header>

      <div className={styles.mainLayout}>
        <aside className={`${styles.sidebar} ${isSidebarOpen ? "" : styles.sidebarCollapsed}`}>
          <div className={styles.newButtonWrapper} ref={dropdownRef}>
            <button className={styles.newButton} onClick={() => setIsDropdownOpen((prev) => !prev)}>
              <Plus className={styles.newButtonIcon} />
              <span>Nuevo</span>
            </button>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button className={styles.dropdownItem} onClick={openFolderModal}>
                  <FolderPlus className={styles.dropdownItemIcon} />
                  <span>Nueva carpeta</span>
                </button>
                <button className={styles.dropdownItem} onClick={triggerFileUpload}>
                  <FileUp className={styles.dropdownItemIcon} />
                  <span>Subir archivo</span>
                </button>
              </div>
            )}
          </div>

          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${activeTab === "inicio" ? styles.navItemActive : ""}`}
              onClick={() => {
                setActiveTab("inicio");
                setSearchQuery("");
              }}
            >
              <HomeIcon className={styles.navItemIcon} />
              <span>Inicio</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "files" ? styles.navItemActive : ""}`}
              onClick={() => setActiveTab("files")}
            >
              <HardDrive className={styles.navItemIcon} />
              <span>Todos los archivos</span>
            </button>
          </nav>
        </aside>

        <main className={styles.contentArea}>
          <div className={styles.contentCard}>
            {loading && files.length === 0 ? (
              <div className={styles.statusContainer}>
                <RefreshCw className={`${styles.statusIcon} ${styles.spin}`} />
                <p>Conectando con S3...</p>
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
              <div className={styles.tabContent}>
                {activeTab === "inicio" ? (
                  <div className={styles.tabView}>
                    <RecentFiles files={files} onDeleteComplete={fetchFiles} />
                    <div className={styles.uploadCardContainer}>
                      <h3 className={styles.uploadCardTitle}>Subir archivos</h3>
                      <Dropzone
                        ref={dropzoneRef}
                        onUploadComplete={fetchFiles}
                        currentPath={currentPath}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={styles.tabView}>
                    <FileList
                      files={files}
                      currentPath={currentPath}
                      onPathChange={setCurrentPath}
                      searchQuery={searchQuery}
                      onSearchQueryChange={setSearchQuery}
                      onDeleteComplete={fetchFiles}
                    />
                    <div className={styles.folderUploadContainer}>
                      <Dropzone
                        ref={dropzoneRef}
                        onUploadComplete={fetchFiles}
                        currentPath={currentPath}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {isCreateFolderModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Nueva carpeta</h3>
              <button
                className={styles.closeModalBtn}
                onClick={() => setIsCreateFolderModalOpen(false)}
                disabled={isUploadingFolder}
              >
                <X className={styles.closeModalIcon} />
              </button>
            </div>
            <form onSubmit={handleCreateFolder} className={styles.modalForm}>
              <input
                type="text"
                placeholder="Carpeta sin título"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className={styles.modalInput}
                autoFocus
                disabled={isUploadingFolder}
              />
              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className={styles.modalBtnCancel}
                  disabled={isUploadingFolder}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.modalBtnConfirm}
                  disabled={isUploadingFolder || !newFolderName.trim()}
                >
                  {isUploadingFolder ? "Creando..." : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
