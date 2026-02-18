import React, { useState } from 'react';

function InputModal({ isOpen, title, placeholder, defaultValue, onConfirm, onCancel }) {
    if (!isOpen) return null;

    const [inputValue, setInputValue] = useState(defaultValue ?? '');

    const handleConfirm = () => {
        onConfirm(inputValue);
        setInputValue('');
    };

    const handleClose = () => {
        onCancel();
        setInputValue('');
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3 className="modal-title">{title}</h3>
                <input
                    type="text"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                    className="modal-input"
                />
                <div className="modal-actions">
                    <button className="btn" onClick={handleConfirm}>Confirmar</button>
                    <button className="btn danger" onClick={handleClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}

export default InputModal;