import React, { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

const ICONS = {
  success: <CheckCircle size={16} />,
  error: <AlertCircle size={16} />,
  info: <Info size={16} />,
};

function Toast({ toast, onClose, duration = 3500 }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setExiting(false);

    const hideTimer = setTimeout(() => setExiting(true), duration);
    const closeTimer = setTimeout(() => onClose?.(), duration + 300);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [toast, duration]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onClose?.(), 300);
  };

  if (!toast) return null;

  const type = toast.type ?? "info";

  return (
    <div className={`toast toast--${type} ${exiting ? "toast--exit" : "toast--enter"}`} role="alert">
      <span className="toast__icon">{ICONS[type]}</span>
      <span className="toast__message">{toast.message}</span>
      <button className="toast__close" onClick={handleClose} aria-label="Close">
        <X size={14} />
      </button>
    </div>
  );
}

export default Toast;
