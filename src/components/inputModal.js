import React, { useEffect, useState } from "react";

function InputModal({ isOpen, title, placeholder, defaultValue, onConfirm, onCancel }) {
  const [inputValue, setInputValue] = useState(defaultValue ?? "");

  useEffect(() => {
    setInputValue(defaultValue ?? "");
  }, [defaultValue]);

  if (!isOpen) return null;

  const getPreviewName = () => {
    const trimmed = inputValue.trim() || placeholder || "archivo";
    return trimmed.endsWith(".json") ? trimmed : `${trimmed}.json`;
  };

  const handleConfirm = () => {
    if (!inputValue.trim()) {
      alert("El campo no puede estar vacío. Introduce un nombre válido.");
      return;
    }
    onConfirm(inputValue.trim());
    setInputValue("");
  };

  const handleCancel = () => {
    onCancel();
    setInputValue("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3 className="modal-title">{title}</h3>
        <div className="preview-text" style={{ whiteSpace: "pre-wrap", marginBottom: "12px" }}>
          <strong>Archivo resultante:</strong> <span style={{ fontFamily: "monospace" }}>{getPreviewName()}</span>
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
          className="modal-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleConfirm();
            if (e.key === "Escape") handleCancel();
          }}
        />
        <div className="modal-actions">
          <button className="btn" onClick={handleConfirm}>
            Confirmar
          </button>
          <button className="btn danger" onClick={handleCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InputModal;
