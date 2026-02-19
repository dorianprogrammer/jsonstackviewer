import React, { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css";
import { Minimize2, AlignLeft } from "lucide-react";

function JsonViewer({ content, isValid, error, onContentChange, onValidation, isViewerEnabled }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: content || "",
      language: "json",
      theme: "vs-dark",
      automaticLayout: true,
      lineNumbers: "on",
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: true,
      wordWrap: "on",
      readOnly: !isViewerEnabled, // El viewer inicialmente en modo lectura si no hay archivo activo
    });

    editorRef.current = editor;

    const model = editor.getModel();
    const onContentChangeDisposable = editor.onDidChangeModelContent(() => {
      const val = model.getValue();
      onContentChange?.(val);

      // Validar JSON
      try {
        JSON.parse(val);
        onValidation?.(true, null);
      } catch (e) {
        onValidation?.(false, e.message);
      }
    });

    return () => {
      onContentChangeDisposable.dispose();
      editor.dispose(); // Limpieza cuando se desmonta el componente
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.updateOptions({ readOnly: !isViewerEnabled });

    // Opcional: Refrescar el editor manualmente
    if (isViewerEnabled) {
      const model = editor.getModel();
      if (model && model.getValue() !== content) {
        model.setValue(content || "{\n\n}");
      }
    }
  }, [isViewerEnabled, content]);

  const formatJson = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const val = model.getValue();
    try {
      const obj = JSON.parse(val);
      const formatted = JSON.stringify(obj, null, 2); // Formatear con sangría de dos espacios
      model.setValue(formatted);
      onContentChange?.(formatted);
      onValidation?.(true, null);
    } catch (e) {
      onValidation?.(false, e.message);
      alert("JSON inválido, no se pudo formatear.");
    }
  };

  const compactJson = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const model = editor.getModel();
    if (!model) return;

    const val = model.getValue();
    try {
      const obj = JSON.parse(val);
      const compacted = JSON.stringify(obj); // Compactar en una línea
      model.setValue(compacted);
      onContentChange?.(compacted);
      onValidation?.(true, null);
    } catch (e) {
      onValidation?.(false, e.message);
      alert("JSON inválido, no se pudo compactar.");
    }
  };

  return (
    <div className="viewer-container">
      {!isViewerEnabled ? (
        <div className="viewer-disabled">
          <p>📝 Para comenzar, crea o selecciona un archivo JSON desde el explorador.</p>
        </div>
      ) : (
        <>
          <div className="viewer-toolbar">
            <button
              onClick={formatJson}
              className="btn"
              title="Formatear JSON"
              disabled={!isViewerEnabled}
            >
              <AlignLeft size={16} />
              Formatear
            </button>
            <button
              onClick={compactJson}
              className="btn"
              title="Compactar JSON"
              disabled={!isViewerEnabled}
            >
              <Minimize2 size={16} />
              Compactar
            </button>
          </div>
          <div className="editor-host" ref={containerRef} />
          {!isValid && (
            <div className="json-error">
              JSON inválido: {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default JsonViewer;