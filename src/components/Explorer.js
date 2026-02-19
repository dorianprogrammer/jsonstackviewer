import React, { useState, useEffect } from "react";
import { FilePlus, Upload } from "lucide-react";
import InputModal from "./InputModal";

function Explorer({
    files,
    activeFileId,
    onSelectFile,
    onCreateFile,
    onImportFiles,
    onRenameFile,
    onDeleteFile,
    viewerContent,
}) {
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        placeholder: "",
        defaultValue: "",
        action: () => { },
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
        setModalConfig({ title: "", placeholder: "", defaultValue: "", action: () => { } });
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
        const confirmed = confirm(`¿Eliminar ${file.name}?`);
        if (confirmed) {
            onDeleteFile(file.id);
        }
    };

    const openContextMenu = (e, fileId) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            fileId,
        });
    };

    const closeContextMenu = () =>
        setContextMenu({ visible: false, x: 0, y: 0, fileId: null });

    useEffect(() => {
        const closeMenu = () => closeContextMenu();
        window.addEventListener("click", closeMenu);
        return () => {
            window.removeEventListener("click", closeMenu);
        };
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
                            alert("Error al importar archivos JSON. Inténtalo de nuevo.");
                        }
                    }}
                    className="btn"
                >
                    <Upload size={16} /> Import
                </button>
            </div>
            <div className="explorer-tree">
                {files.length === 0 ? (
                    <span>No hay archivos disponibles</span>
                ) : (
                    <ul>
                        {files.map((file) => (
                            <li
                                key={file.id}
                                onClick={() => onSelectFile(file.id)}
                                onContextMenu={(e) => openContextMenu(e, file.id)}
                                className={`explorer-item ${activeFileId === file.id ? "active" : ""
                                    }`}
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
                        position: "absolute",
                        top: `${contextMenu.y}px`,
                        left: `${contextMenu.x}px`,
                        zIndex: 1000,
                        background: "#2d2d2d",
                        padding: "10px",
                        borderRadius: "4px",
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.4)",
                    }}
                >
                    <div
                        className="context-menu-item"
                        style={{ padding: "6px 10px", cursor: "pointer" }}
                        onClick={() => {
                            handleRename(contextMenu.fileId);
                            closeContextMenu();
                        }}
                    >
                        Rename
                    </div>
                    <div
                        className="context-menu-item danger"
                        style={{ padding: "6px 10px", cursor: "pointer", color: "#ff6b6b" }}
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