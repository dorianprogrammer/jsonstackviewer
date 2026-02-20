import React, { useState, useEffect, useRef } from "react";
import { FilePlus, Upload, FileJson, Trash2, Download } from "lucide-react";
import InputModal from "./inputModal";
import ConfirmModal from "./ConfirmModal";

function Explorer({ files, activeFileId, onSelectFile, onCreateFile, onImportFiles, onRenameFile, onDeleteFile, onExportFile }) {
  const [showModal, setShowModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "",
    placeholder: "",
    defaultValue: "",
    action: () => {},
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    fileId: null,
    fileName: "",
  });

  const [editingFileId, setEditingFileId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const inlineInputRef = useRef(null);

  useEffect(() => {
    if (editingFileId && inlineInputRef.current) {
      inlineInputRef.current.focus();
      const val = inlineInputRef.current.value;
      const dotIndex = val.lastIndexOf(".json");
      inlineInputRef.current.setSelectionRange(0, dotIndex > 0 ? dotIndex : val.length);
    }
  }, [editingFileId]);

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
      if (!name.trim()) return;
      const finalName = name.endsWith(".json") ? name : `${name}.json`;
      onCreateFile({ name: finalName, content: "{\n\n}" });
      closeModal();
    });
  };

  const startInlineRename = (e, file) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const commitInlineRename = () => {
    const trimmed = editingName.trim();
    if (trimmed && trimmed !== files.find((f) => f.id === editingFileId)?.name) {
      const finalName = trimmed.endsWith(".json") ? trimmed : `${trimmed}.json`;
      onRenameFile(editingFileId, finalName);
    }
    setEditingFileId(null);
    setEditingName("");
  };

  const cancelInlineRename = () => {
    setEditingFileId(null);
    setEditingName("");
  };

  const handleInlineKeyDown = (e) => {
    if (e.code === "Enter") commitInlineRename();
    if (e.code === "Escape") cancelInlineRename();
  };

  const handleDelete = (e, fileId) => {
    e.stopPropagation();
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    setConfirmModal({ isOpen: true, fileId: file.id, fileName: file.name });
  };

  const handleConfirmDelete = () => {
    onDeleteFile(confirmModal.fileId);
    setConfirmModal({ isOpen: false, fileId: null, fileName: "" });
  };

  const handleCancelDelete = () => {
    setConfirmModal({ isOpen: false, fileId: null, fileName: "" });
  };

  return (
    <div className="explorer-container">
      <div className="explorer-toolbar">
        <button onClick={handleCreateFile} className="btn">
          <FilePlus size={16} /> New JSON
        </button>
        <button
          onClick={async () => {
            await onImportFiles();
          }}
          className="btn"
        >
          <Upload size={16} /> Import
        </button>
        <button
          onClick={async () => {
            await onExportFile?.();
            }}
            className="btn"
            disabled={!activeFileId}
            title={!activeFileId ? "Select a file to export" : "Export file"}
          >
            <Download size={16} /> Export
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
              onClick={() => {
                  if (editingFileId !== file.id) onSelectFile(file.id);
                }}
                className={`explorer-item ${activeFileId === file.id ? "active" : ""} ${editingFileId === file.id ? "editing" : ""}`}
              >
                {editingFileId === file.id ? (
                  <input
                    ref={inlineInputRef}
                    className="explorer-inline-input"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleInlineKeyDown}
                    onBlur={commitInlineRename}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span
                      className="explorer-item-name"
                      onDoubleClick={(e) => startInlineRename(e, file)}
                      title="Double-click to rename"
                    >
                      {file.name}
                    </span>
                    <button
                      className="explorer-item-delete"
                      onClick={(e) => handleDelete(e, file.id)}
                      title="Delete file"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <InputModal
        isOpen={showModal}
        title={modalConfig.title}
        placeholder={modalConfig.placeholder}
        defaultValue={modalConfig.defaultValue}
        onConfirm={(value) => modalConfig.action(value)}
        onCancel={closeModal}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        fileName={confirmModal.fileName}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}

export default Explorer;
