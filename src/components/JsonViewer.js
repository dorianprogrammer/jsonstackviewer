import React, { useEffect, useRef, useState } from "react";
import { EditorView, lineNumbers, keymap, scrollPastEnd } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultKeymap, historyKeymap, history, indentWithTab } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches, search } from "@codemirror/search";
import { Minimize2, AlignLeft, ArrowUp } from "lucide-react";

const readOnlyCompartment = new Compartment();

function JsonViewer({ fileId, initialContent, isViewerEnabled, onContentChange }) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState(null);

  const onContentChangeRef = useRef(onContentChange);
  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  const fileIdRef = useRef(fileId);
  const initialContentRef = useRef(initialContent);
  useEffect(() => {
    fileIdRef.current = fileId;
  }, [fileId]);
  useEffect(() => {
    initialContentRef.current = initialContent;
  }, [initialContent]);

  const validate = (val) => {
    try {
      if (val.trim()) JSON.parse(val);
      setIsValid(true);
      setError(null);
    } catch (e) {
      setIsValid(false);
      setError(e.message);
    }
  };

  // Create CodeMirror once
  useEffect(() => {
    const updateListener = EditorView.updateListener.of((update) => {
      // Scroll tracking
      if (update.view.scrollDOM.scrollTop > 100) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
      // Content change — only propagate user edits
      if (update.docChanged) {
        const val = update.state.doc.toString();
        onContentChangeRef.current?.(val);
        validate(val);
      }
    });

    const view = new EditorView({
      state: EditorState.create({
        doc: initialContentRef.current || "",
        extensions: [
          history(),
          lineNumbers(),
          json(),
          oneDark,
          highlightSelectionMatches(),
          search({ top: true }),
          keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap, indentWithTab]),
          EditorView.lineWrapping,
          readOnlyCompartment.of(EditorState.readOnly.of(!fileIdRef.current)),
          updateListener,
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;

    // Focus if a file is already loaded
    if (fileIdRef.current) {
      requestAnimationFrame(() => view.focus());
    }

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When fileId changes, load new content and reset state
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    if (!fileId) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: "" },
        effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(true)),
      });
      setIsValid(true);
      setError(null);
      return;
    }

    // Replace entire content and unlock editing
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: initialContent || "" },
      effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(false)),
    });
    // Scroll to top
    view.dispatch({ selection: { anchor: 0 } });
    view.scrollDOM.scrollTop = 0;
    setIsValid(true);
    setError(null);
    requestAnimationFrame(() => view.focus());
  }, [fileId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getValue = () => viewRef.current?.state.doc.toString() ?? "";

  const setValue = (val) => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: val },
    });
  };

  const formatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(getValue()), null, 2);
      setValue(formatted);
      onContentChangeRef.current?.(formatted);
      setIsValid(true);
      setError(null);
    } catch (e) {
      setIsValid(false);
      setError(e.message);
      alert("JSON inválido, no se pudo formatear.");
    }
  };

  const compactJson = () => {
    try {
      const compacted = JSON.stringify(JSON.parse(getValue()));
      setValue(compacted);
      onContentChangeRef.current?.(compacted);
      setIsValid(true);
      setError(null);
    } catch (e) {
      setIsValid(false);
      setError(e.message);
      alert("JSON inválido, no se pudo compactar.");
    }
  };

  const scrollToTop = () => {
    if (viewRef.current) {
      viewRef.current.scrollDOM.scrollTop = 0;
    }
  };

  return (
    <div className="viewer-container">
      <div className="viewer-toolbar" style={{ display: isViewerEnabled ? "flex" : "none" }}>
        <button onClick={formatJson} className="btn" title="Formatear JSON">
          <AlignLeft size={16} /> Formatear
        </button>
        <button onClick={compactJson} className="btn" title="Compactar JSON">
          <Minimize2 size={16} /> Compactar
        </button>
      </div>

      {isViewerEnabled && showScrollTop && (
        <div className="scroll-to-top-bar">
          <button className="scroll-to-top-btn" onClick={scrollToTop} title="Volver al inicio">
            <ArrowUp size={14} />
            <span>Volver al inicio</span>
          </button>
        </div>
      )}

      <div
        className="editor-host"
        ref={containerRef}
        style={{ display: isViewerEnabled ? "flex" : "none", flex: 1, minHeight: 0, overflow: "auto" }}
      />

      {!isViewerEnabled && (
        <div className="viewer-disabled">
          <p>Select or create a JSON file to get started.</p>
        </div>
      )}

      {isViewerEnabled && !isValid && <div className="json-error">JSON inválido: {error}</div>}
    </div>
  );
}

export default JsonViewer;
