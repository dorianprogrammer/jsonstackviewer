import React, { useState, useEffect } from "react";
import { FilePlus, Upload, FileJson } from "lucide-react";
import InputModal from "./InputModal";

function Explorer({ files, activeFileId, onSelectFile, onCreateFile, onImportFiles, onRenameFile, onDeleteFile }) {
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    placeholder: "",
    defaultValue: "",
    action: () => {},
  });

  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    fileId: null,
  });

  const openModal = (title, placeholder, defaultValue, action) => {
    setModalConfig({ title, placeholder, defaultValue, action });
    setShowModal(true);
  };

  const closeModal = () => {
    setModalConfig({ title: "", placeholder: "", defaultValue: "", action: () => {} });
    setShowModal(false);
  };

  const handleCreateFile = () => {
    openModal("Create new JSON file", "File name...", "", (name) => {
      if (!name.trim()) {
        alert("File name cannot be empty.");
        return;
      }
      const finalName = name.endsWith(".json") ? name : `${name}.json`;
      onCreateFile({ name: finalName, content: "{\n\n}" });
      closeModal();
    });
  };

  const handleRename = (fileId) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    openModal("Rename JSON file", "New name for the file...", file.name, (newName) => {
      if (!newName.trim()) {
        alert("File name cannot be empty.");
        return;
      }
      const finalName = newName.endsWith(".json") ? newName : `${newName}.json`;
      onRenameFile(fileId, finalName);
      closeModal();
    });
  };

  const handleDelete = (fileId) => {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    const confirmed = confirm(`Delete ${file.name}?`);
    if (confirmed) {
      onDeleteFile(file.id);
    }
  };

  const openContextMenu = (e, fileId) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, fileId });
  };

  const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, fileId: null });

  useEffect(() => {
    window.addEventListener("click", closeContextMenu);
    return () => window.removeEventListener("click", closeContextMenu);
  }, []);

  return (
    <div className="explorer-container">
      <div className="explorer-toolbar">
        <button onClick={handleCreateFile} className="btn">
          <FilePlus size={16} /> New JSON
        </button>
        <button
          onClick={async () => {
            const importedFiles = await onImportFiles();
            if (!Array.isArray(importedFiles)) {
              alert("Failed to import JSON files. Please try again.");
            }
          }}
          className="btn"
        >
          <Upload size={16} /> Import
        </button>
      </div>
      <div className="explorer-tree">
        {files.length === 0 ? (
          <div className="explorer-empty-state">
            <FileJson size={32} className="explorer-empty-icon" />
            <p className="explorer-empty-title">No files yet</p>
            <p className="explorer-empty-hint">Create a new file or import an existing JSON to get started.</p>
          </div>
        ) : (
          <ul>
            {files.map((file) => (
              <li
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                onContextMenu={(e) => openContextMenu(e, file.id)}
                className={`explorer-item ${activeFileId === file.id ? "active" : ""}`}
              >
                {file.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {contextMenu.visible && (
        <div
          className="context-menu"
          style={{
            position: "fixed",
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
          }}
        >
          <div
            className="context-menu-item"
            onClick={() => {
              handleRename(contextMenu.fileId);
              closeContextMenu();
            }}
          >
            Rename
          </div>
          <div
            className="context-menu-item danger"
            onClick={() => {
              handleDelete(contextMenu.fileId);
              closeContextMenu();
            }}
          >
            Delete
          </div>
        </div>
      )}
      <InputModal
        isOpen={showModal}
        title={modalConfig.title}
        placeholder={modalConfig.placeholder}
        defaultValue={modalConfig.defaultValue}
        onConfirm={(value) => modalConfig.action(value)}
        onCancel={closeModal}
      />
    </div>
  );
}

export default Explorer;
