import React, { useEffect } from "react";
import { X } from 'lucide-react';

function Toast({ toast, onClose, duration = 5000 }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => onClose?.(), duration);
        return () => clearTimeout(t);
    }, [toast, onClose, duration]);

    if (!toast) return null;

    return (
        <div className={`toast toast-${toast.type ?? "info"}`} role="alert">
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={onClose} aria-label="Close">
                <X size={24} color="red" />
            </button>
        </div>
    );
}

export default Toast;