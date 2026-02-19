import React, { useMemo } from "react";
import ResizablePanels from "./ResizablePanels";
import Explorer from "./Explorer";
import JsonViewer from "./JsonViewer";

function Tab({ tab, onUpdateTab }) {
  const activeFile = useMemo(() => tab.files.find((f) => f.id === tab.activeFileId), [tab.files, tab.activeFileId]);

  const isViewerEnabled = !!activeFile;

  const setActiveFileId = (fileId) => {
    onUpdateTab(tab.id, { activeFileId: fileId });
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
          fileId={activeFile?.id ?? null}
          initialContent={activeFile?.content ?? ""}
          isViewerEnabled={isViewerEnabled}
          onContentChange={onContentChange}
        />
      }
    />
  );
}

export default Tab;
