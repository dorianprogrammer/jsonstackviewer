import React, { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css";
import { Minimize2, AlignLeft, ArrowUp } from "lucide-react";

function JsonViewer({ content, isValid, error, onContentChange, onValidation, isViewerEnabled }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Keep callbacks in refs to avoid stale closures in the Monaco listener
  const onContentChangeRef = useRef(onContentChange);
  const onValidationRef = useRef(onValidation);
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);
  useEffect(() => {
    onValidationRef.current = onValidation;
  }, [onValidation]);

  // Create editor once
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
      readOnly: true,
    });

    editorRef.current = editor;

    const scrollDisposable = editor.onDidScrollChange((e) => {
      setShowScrollTop(e.scrollTop > 100);
    });

    const disposable = editor.onDidChangeModelContent(() => {
      const val = editor.getModel().getValue();
      onContentChangeRef.current?.(val);
      try {
        JSON.parse(val);
        onValidationRef.current?.(true, null);
      } catch (e) {
        onValidationRef.current?.(false, e.message);
      }
    });

    return () => {
      scrollDisposable.dispose();
      disposable.dispose();
      setTimeout(() => {
        editor.dispose();
      }, 0);
      editorRef.current = null;
    };
  }, []);

  // Sync content when active file changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;
    if (model.getValue() !== content) {
      // Suppress the change event while we programmatically set the value
      model.setValue(content || "");
    }
  }, [content]);

  // Sync readOnly when isViewerEnabled changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.updateOptions({ readOnly: !isViewerEnabled });
  }, [isViewerEnabled]);

  const formatJson = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const val = editor.getModel().getValue();
    try {
      const formatted = JSON.stringify(JSON.parse(val), null, 2);
      editor.getModel().setValue(formatted);
      onContentChangeRef.current?.(formatted);
      onValidationRef.current?.(true, null);
    } catch (e) {
      onValidationRef.current?.(false, e.message);
      alert("JSON inválido, no se pudo formatear.");
    }
  };

  const compactJson = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const val = editor.getModel().getValue();
    try {
      const compacted = JSON.stringify(JSON.parse(val));
      editor.getModel().setValue(compacted);
      onContentChangeRef.current?.(compacted);
      onValidationRef.current?.(true, null);
    } catch (e) {
      onValidationRef.current?.(false, e.message);
      alert("JSON inválido, no se pudo compactar.");
    }
  };

  const scrollToTop = () => {
    editorRef.current?.setScrollTop(0);
  };

  return (
    <div className="viewer-container">
      {!isViewerEnabled ? (
        <div className="viewer-disabled">
          <p>Select or create a JSON file to get started.</p>
        </div>
      ) : (
        <>
          <div className="viewer-toolbar">
            <button onClick={formatJson} className="btn" title="Formatear JSON">
              <AlignLeft size={16} /> Formatear
            </button>
            <button onClick={compactJson} className="btn" title="Compactar JSON">
              <Minimize2 size={16} /> Compactar
            </button>
          </div>
          {showScrollTop && (
            <div className="scroll-to-top-bar">
              <button className="scroll-to-top-btn" onClick={scrollToTop} title="Volver al inicio">
                <ArrowUp size={14} />
                <span>Volver al inicio</span>
              </button>
            </div>
          )}
          <div className="editor-host" ref={containerRef} />
          {!isValid && <div className="json-error">JSON inválido: {error}</div>}
        </>
      )}
    </div>
  );
}

export default JsonViewer;
