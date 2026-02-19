import React, { useState, useMemo } from "react";
import ResizablePanels from "./ResizablePanels";
import Explorer from "./Explorer";
import JsonViewer from "./JsonViewer";

function Tab({ tab, onUpdateTab }) {
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState(null);

  // Identifica el archivo activo
  const activeFile = useMemo(
    () => tab.files.find((f) => f.id === tab.activeFileId),
    [tab.files, tab.activeFileId]
  );
  const viewerContent = activeFile?.content ?? "";

  const isViewerEnabled = !!activeFile;

  const setActiveFileId = (fileId) => {
    onUpdateTab(tab.id, { activeFileId: fileId });
  };

  const onCreateFile = ({ name, content }) => {
    const newFile = { id: Date.now().toString(), name, content };
    const files = [...tab.files, newFile];
    onUpdateTab(tab.id, { files, activeFileId: newFile.id });
  };

  const onImportFiles = async () => {
    const { importedFiles, errors } = await window.electronAPI.importJsonFiles();

    if (errors.length > 0) {
      alert(`Error al importar archivos:\n${errors.join("\n")}`);
    }

    if (Array.isArray(importedFiles) && importedFiles.length > 0) {
      const importedWithIds = importedFiles.map((file) => ({
        id: Date.now().toString() + Math.random(), // Generar un ID único
        ...file,
      }));

      const files = [...tab.files, ...importedWithIds];
      const activeFileId = importedWithIds[0]?.id ?? null;
      onUpdateTab(tab.id, { files, activeFileId });
    }
  };

  const onRenameFile = (fileId, newName) => {
    const files = tab.files.map((f) => (f.id === fileId ? { ...f, name: newName } : f));
    onUpdateTab(tab.id, { files });
  };

  const onDeleteFile = (fileId) => {
    const files = tab.files.filter((f) => f.id !== fileId);
    const newActiveFileId =
      tab.activeFileId === fileId ? (files[0]?.id ?? null) : tab.activeFileId;
    onUpdateTab(tab.id, { files, activeFileId: newActiveFileId });
  };
  const onContentChange = (newContent) => {
    if (activeFile) {
      const updatedFiles = tab.files.map((file) =>
        file.id === activeFile.id ? { ...file, content: newContent } : file
      );
      onUpdateTab(tab.id, { files: updatedFiles });
    }
  };

  const handleValidation = (valid, errorMsg) => {
    setIsValid(valid);
    setError(errorMsg);
  };

  return (
    <ResizablePanels
      left={
        <Explorer
          files={tab.files}
          activeFileId={tab.activeFileId}
          onSelectFile={setActiveFileId}
          onCreateFile={onCreateFile}
          onImportFiles={onImportFiles}
          onRenameFile={onRenameFile}
          onDeleteFile={onDeleteFile}
          viewerContent={viewerContent}
        />
      }
      right={
        <JsonViewer
          content={viewerContent}
          isValid={isValid}
          error={error}
          onContentChange={onContentChange}
          onValidation={handleValidation}
          isViewerEnabled={isViewerEnabled} // Habilitar o deshabilitar Viewer
        />
      }
    />
  );
}

export default Tab;