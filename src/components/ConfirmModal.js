import React, { useEffect } from "react";
import { Trash2 } from "lucide-react";

function ConfirmModal({ isOpen, fileName, onConfirm, onCancel }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.code === "Enter") onConfirm();
      if (e.code === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal confirm-modal">
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">
            <Trash2 size={18} />
          </div>
          <h3 className="modal-title">Delete file</h3>
        </div>
        <p className="confirm-modal-body">
          Are you sure you want to delete <span className="confirm-modal-filename">{fileName}</span>?
          <br />
          <span className="confirm-modal-warning">This action cannot be undone.</span>
        </p>
        <div className="modal-actions">
          <button className="btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn confirm-delete" onClick={onConfirm} autoFocus>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
