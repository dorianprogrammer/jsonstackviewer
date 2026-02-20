import React, { useEffect, useRef, useState } from "react";
import { EditorView, lineNumbers, keymap, drawSelection } from "@codemirror/view";
import { EditorState, Compartment } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { defaultKeymap, historyKeymap, history, indentWithTab } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches, search } from "@codemirror/search";
import {
  foldGutter,
  syntaxHighlighting,
  defaultHighlightStyle,
  foldAll,
  unfoldAll,
  foldEffect,
} from "@codemirror/language";
import { syntaxTree } from "@codemirror/language";
import { Minimize2, AlignLeft, ArrowUp, ChevronsUpDown, ChevronDown } from "lucide-react";

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
      if (update.view.scrollDOM.scrollTop > 100) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
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
          foldGutter(),
          json(),
          oneDark,
          syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
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

    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: initialContent || "" },
      effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(false)),
    });
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
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: val } });
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

  // Fold every foldable node in the document
  const foldAllNodes = () => {
    const view = viewRef.current;
    if (!view) return;
    unfoldAll(view);
    foldAll(view);
  };

  // Fold only inner nodes — keep root object/array open
  const foldInner = () => {
    const view = viewRef.current;
    if (!view) return;

    // Start clean
    unfoldAll(view);

    const state = view.state;
    const tree = syntaxTree(state);
    const effects = [];

    // Find the root node (first child of Document)
    const root = tree.topNode.firstChild;
    if (!root) return;

    // Walk all descendants of the root and fold Object/Array nodes
    // The foldEffect range is: from the opening brace+1 to closing brace-1
    root.cursor().iterate((node) => {
      // Skip the root itself
      if (node.from === root.from && node.to === root.to) return;
      if (node.name === "Object" || node.name === "Array") {
        // from: position after opening { or [
        // to: position before closing } or ]
        const from = node.from + 1;
        const to = node.to - 1;
        if (to > from + 1) {
          effects.push(foldEffect.of({ from, to }));
        }
      }
    });

    if (effects.length > 0) {
      view.dispatch({ effects });
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
        <div className="btn-separator" />
        <button onClick={foldAllNodes} className="btn" title="Colapsar todo">
          <ChevronsUpDown size={16} /> Colapsar todo
        </button>
        <button onClick={foldInner} className="btn" title="Colapsar internos">
          <ChevronDown size={16} /> Colapsar internos
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
