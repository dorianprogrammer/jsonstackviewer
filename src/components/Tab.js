import React, { useState, useMemo } from "react";
import ResizablePanels from "./ResizablePanels";
import Explorer from "./Explorer";
import JsonViewer from "./JsonViewer";

function Tab({ tab, onUpdateTab }) {
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState(null);

  const activeFile = useMemo(
    () => tab.files.find((f) => f.id === tab.activeFileId),
    [tab.files, tab.activeFileId]
  );
  const viewerContent = activeFile?.content ?? "";

  const setActiveFileId = (fileId) => onUpdateTab(tab.id, { activeFileId: fileId });

  const onCreateFile = ({ name, content }) => {
    const newFile = { id: Date.now().toString(), name, content };
    const files = [...tab.files, newFile];
    onUpdateTab(tab.id, { files, activeFileId: newFile.id });
  };

const onImportFiles = (importedFiles) => {
  // Validamos que `importedFiles` sea válido y que sea un array.
  if (!Array.isArray(importedFiles) || importedFiles.length === 0) return;

  const withIds = importedFiles.map((file) => ({
    id: Date.now().toString(),
    ...file,
  }));

  const files = [...tab.files, ...withIds];
  const activeFileId = withIds[0]?.id ?? null; // Abrir el primero de los importados (si existe)
  
  onUpdateTab(tab.id, { files, activeFileId });
};

  const onRenameFile = (fileId, newName) => {
    const files = tab.files.map((f) => (f.id === fileId ? { ...f, name: newName } : f));
    onUpdateTab(tab.id, { files });
  };

  const onDeleteFile = (fileId) => {
    const files = tab.files.filter((f) => f.id !== fileId);
    const newActive = tab.activeFileId === fileId ? (files[0]?.id ?? null) : tab.activeFileId;
    onUpdateTab(tab.id, { files, activeFileId: newActive });
  };

  const onContentChange = (newContent) => {
    if (!activeFile) {
      // Crear uno si el usuario empieza a escribir sin archivo activo
      const newFile = {
        id: Date.now().toString(),
        name: "untitled.json",
        content: newContent,
      };
      const files = [...tab.files, newFile];
      onUpdateTab(tab.id, { files, activeFileId: newFile.id });
      return;
    }
    const files = tab.files.map((f) => (f.id === activeFile.id ? { ...f, content: newContent } : f));
    onUpdateTab(tab.id, { files });
  };

  const handleValidation = (valid, errorMsg) => {
    setIsValid(valid);
    setError(errorMsg);
  };

  return (
    <div className="tab-container">
      <ResizablePanels
        left={
          <div className="tab-panel">
            <div className="panel-header">Explorer</div>
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
          </div>
        }
        right={
          <div className="tab-panel">
            <div className="panel-header">Viewer</div>
            <JsonViewer
              content={viewerContent}
              isValid={isValid}
              error={error}
              onContentChange={onContentChange}
              onValidation={handleValidation}
            />
          </div>
        }
      />
    </div>
  );
}

export default Tab;