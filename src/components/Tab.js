import React, { useState } from "react";
import JsonEditor from "./JsonEditor";
import JsonViewer from "./JsonViewer";
import ResizablePanels from "./ResizablePanels";

function Tab({ tab, onContentChange }) {
  const [isValid, setIsValid] = useState(true);
  const [error, setError] = useState(null);

  const handleValidation = (valid, errorMsg) => {
    setIsValid(valid);
    setError(errorMsg);
  };

  const handleContentChange = (newContent) => {
    onContentChange(tab.id, newContent);
  };

  return (
    <div className="tab-container">
      <ResizablePanels
        left={
          <div className="tab-panel">
            <div className="panel-header">Editor</div>
            <JsonEditor content={tab.content} onChange={handleContentChange} onValidation={handleValidation} />
          </div>
        }
        right={
          <div className="tab-panel">
            <div className="panel-header">Viewer</div>
            <JsonViewer content={tab.content} isValid={isValid} error={error} />
          </div>
        }
      />
    </div>
  );
}

export default Tab;
