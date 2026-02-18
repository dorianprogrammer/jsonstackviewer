import React, { useEffect, useRef, useState } from "react";
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

    const openModal = (title, placeholder, defaultValue, action) => {
        setModalConfig({ title, placeholder, defaultValue, action });
        setShowModal(true);
    };

    const handleCreateFile = () => {
        openModal("Crear nuevo archivo JSON", "Nombre del archivo...", "", (name) => {
            const finalName = name.endsWith(".json") ? name : `${name}.json`;
            onCreateFile({ name: finalName, content: "{\n\n}" });
        });
    };

    const handleRename = (fileId) => {
        const file = files.find((f) => f.id === fileId);
        if (!file) return;
        openModal("Renombrar archivo JSON", "Nuevo nombre...", file.name, (newName) => {
            const finalName = newName.endsWith(".json") ? newName : `${newName}.json`;
            onRenameFile(file.id, finalName);
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

    return (
        <div className="explorer-container">
            <div className="explorer-toolbar">
                <button onClick={handleCreateFile} className="btn">
                    <FilePlus size={16} /> New JSON
                </button>
                <button onClick={onImportFiles} className="btn">
                    <Upload size={16} /> Import
                </button>
            </div>

            <div className="explorer-tree">
                {files.length === 0 ? (
                    <div>No hay archivos disponibles</div>
                ) : (
                    <ul>
                        {files.map((file) => (
                            <li
                                key={file.id}
                                className={`explorer-item ${activeFileId === file.id ? "active" : ""}`}
                                onClick={() => onSelectFile(file.id)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    const menuOptions = document.createElement("menu");
                                    const rename = document.createElement("div");
                                    const del = document.createElement("div");

                                    rename.textContent = "Rename";
                                    del.textContent = "Delete";

                                    rename.onclick = () => handleRename(file.id);
                                    del.onclick = (() => handleDelete(file.id));

                                    document.body.appendChild(menuOptions);
                                    menuOptions.appendChild(rename);
                                    menuOptions.appendChild(del);

                                    menuOptions.style.position = "absolute";
                                    menuOptions.style.left = `${e.clientX}px`;
                                    menuOptions.style.top = `${e.clientY}px\n\nvol`;
                                }}
                            >
                                {file.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Modal */}
            <InputModal
                isOpen={showModal}
                title={modalConfig.title}
                placeholder={modalConfig.placeholder}
                defaultValue={modalConfig.defaultValue}
                onConfirm={(value) => {
                    setShowModal(false);
                    modalConfig.action(value);
                }}
                onCancel={() => setShowModal(false)}
            />
        </div>
    );
}

export default Explorer;