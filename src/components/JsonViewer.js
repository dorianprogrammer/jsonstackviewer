import React, { useEffect, useRef, useState } from "react";
import * as monaco from "monaco-editor";
import 'monaco-editor/min/vs/editor/editor.main.css';
import { Minimize2, AlignLeft, GitBranch } from "lucide-react";
import JsonTree from "./JsonTree";

function JsonViewer({ content, isValid, error, onContentChange, onValidation }) {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const editor = monaco.editor.create(containerRef.current, {
      value: content || "{\n\n}",
      language: "json",
      theme: "vs-dark",
      automaticLayout: true,
      lineNumbers: "on",
      minimap: { enabled: false },
      fontSize: 14,
      scrollBeyondLastLine: false,
      wordWrap: "on",
    });
    editorRef.current = editor;

    const model = editor.getModel();
    const sub = editor.onDidChangeModelContent(() => {
      const val = model.getValue();
      onContentChange?.(val);
      try {
        if (val.trim()) {
          JSON.parse(val);
          onValidation?.(true, null);
        } else {
          onValidation?.(true, null);
        }
      } catch (e) {
        onValidation?.(false, e.message);
      }
    });

    return () => {
      sub.dispose();
      editor.dispose();
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    if (model && content !== model.getValue()) {
      model.setValue(content || "{\n\n}");
    }
  }, [content]);

  const formatJson = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const val = editor.getModel().getValue();
    try {
      const obj = JSON.parse(val);
      const formatted = JSON.stringify(obj, null, 2);
      editor.getModel().setValue(formatted);
      onContentChange?.(formatted);
      onValidation?.(true, null);
      // editor.getAction("editor.action.formatDocument").run(); // opcional
    } catch (e) {
      onValidation?.(false, e.message);
      alert("JSON inválido, no se pudo formatear.");
    }
  };

  const compactJson = () => {
    const editor = editorRef.current;
    if (!editor) return;
    const val = editor.getModel().getValue();
    try {
      const obj = JSON.parse(val);
      const compact = JSON.stringify(obj);
      editor.getModel().setValue(compact);
      onContentChange?.(compact);
      onValidation?.(true, null);
    } catch (e) {
      onValidation?.(false, e.message);
      alert("JSON inválido, no se pudo compactar.");
    }
  };

  let parsedForTree = null;
  try {
    parsedForTree = content && content.trim() ? JSON.parse(content) : {};
  } catch {
    parsedForTree = null;
  }

  return (
    <div className="viewer-container">
      <div className="viewer-toolbar">
        <button onClick={formatJson} className="btn" title="Formatear">
          <AlignLeft size={16} /> Formatear
        </button>
        <button onClick={compactJson} className="btn" title="Compactar">
          <Minimize2 size={16} /> Compactar
        </button>
      </div>

      <div className="editor-host" ref={containerRef} />

      {!isValid && <div className="json-error">JSON inválido: {error}</div>}

      {parsedForTree && (
        <div className="tree-host">
          <JsonTree data={parsedForTree} />
        </div>
      )}
    </div>
  );
}

export default JsonViewer;