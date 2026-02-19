import React, { useState, useMemo } from "react";
import ResizablePanels from "./ResizablePanels";
import Explorer from "./Explorer";
import JsonViewer from "./JsonViewer";

function Tab({ tab, onUpdateTab }) {
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState(null);

  const activeFile = useMemo(() => tab.files.find((f) => f.id === tab.activeFileId), [tab.files, tab.activeFileId]);
  const viewerContent = activeFile?.content ?? "";
  const isViewerEnabled = !!activeFile;

  const setActiveFileId = (fileId) => {
    onUpdateTab(tab.id, { activeFileId: fileId });
    // Reset validation state when switching files
    setIsValid(true);
    setError(null);
  };

  const onCreateFile = ({ name, content }) => {
    const newFile = { id: crypto.randomUUID(), name, content };
    onUpdateTab(tab.id, { files: [...tab.files, newFile], activeFileId: newFile.id });
  };

  const onImportFiles = async () => {
    const { importedFiles, errors } = await window.electronAPI.importJsonFiles();

    if (errors?.length > 0) {
      alert(`Error al importar archivos:\n${errors.join("\n")}`);
    }

    if (!Array.isArray(importedFiles) || importedFiles.length === 0) return;

    const importedWithIds = importedFiles.map((file) => ({
      id: crypto.randomUUID(),
      ...file,
    }));

    onUpdateTab(tab.id, {
      files: [...tab.files, ...importedWithIds],
      activeFileId: importedWithIds[0].id,
    });
  };

  const onRenameFile = (fileId, newName) => {
    const files = tab.files.map((f) => (f.id === fileId ? { ...f, name: newName } : f));
    onUpdateTab(tab.id, { files });
  };

  const onDeleteFile = (fileId) => {
    const files = tab.files.filter((f) => f.id !== fileId);
    const newActiveFileId = tab.activeFileId === fileId ? (files[0]?.id ?? null) : tab.activeFileId;
    onUpdateTab(tab.id, { files, activeFileId: newActiveFileId });
  };

  const onContentChange = (newContent) => {
    if (!activeFile) return;
    const updatedFiles = tab.files.map((f) => (f.id === activeFile.id ? { ...f, content: newContent } : f));
    onUpdateTab(tab.id, { files: updatedFiles });
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
        />
      }
      right={
        <JsonViewer
          content={viewerContent}
          isValid={isValid}
          error={error}
          onContentChange={onContentChange}
          onValidation={handleValidation}
          isViewerEnabled={isViewerEnabled}
        />
      }
    />
  );
}

export default Tab;
