import React, { useEffect, useState } from "react";

function InputModal({ isOpen, title, placeholder, defaultValue, onConfirm, onCancel }) {
    const [inputValue, setInputValue] = useState(defaultValue ?? "");

    useEffect(() => {
        setInputValue(defaultValue ?? "");
    }, [defaultValue]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!inputValue.trim()) {
            alert("El campo no puede estar vacío. Introduce un nombre válido.");
            return;
        }
        onConfirm(inputValue.trim());
        setInputValue(""); // Limpiamos el valor después de confirmar
    };

    const handleCancel = () => {
        onCancel();
        setInputValue(""); // Limpiamos el valor después de cancelar
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="modal-title">{title}</h3> 
                <div className="preview-text" style={{ whiteSpace: "pre-wrap", marginBottom: "12px" }}>
                    <strong>Archivo resultante:</strong>{' '}
                    <span style={{ fontFamily: "monospace" }}>
                        {inputValue.trim() ? `${inputValue.trim()}.json` : `${placeholder || 'archivo'}.json`}
                    </span>
                </div>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                    className="modal-input"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleConfirm(); // Confirmar con Enter
                        if (e.key === "Escape") handleCancel(); // Cancelar con Escape
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