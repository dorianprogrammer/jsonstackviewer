import React, { useState } from "react";

function TabBar({ tabs, activeTabId, onTabClick, onTabClose, onAddTab, onTabRename }) {
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const handleDoubleClick = (tab) => {
    setEditingTabId(tab.id);
    setEditingName(tab.name);
  };

  const handleNameChange = (e) => {
    setEditingName(e.target.value);
  };

  const handleNameSubmit = (tabId) => {
    if (editingName.trim()) {
      onTabRename(tabId, editingName.trim());
    }
    setEditingTabId(null);
    setEditingName("");
  };

  const handleKeyDown = (e, tabId) => {
    if (e.key === "Enter") {
      handleNameSubmit(tabId);
    } else if (e.key === "Escape") {
      setEditingTabId(null);
      setEditingName("");
    }
  };

  const handleBlur = (tabId) => {
    handleNameSubmit(tabId);
  };

  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onTabClick(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab)}
          className={`tab ${tab.id === activeTabId ? "active" : ""}`}
        >
          {editingTabId === tab.id ? (
            <input
              type="text"
              value={editingName}
              onChange={handleNameChange}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              onBlur={() => handleBlur(tab.id)}
              onClick={(e) => e.stopPropagation()}
              className="tab-name-input"
              autoFocus
            />
          ) : (
            <span className="tab-name">{tab.name}</span>
          )}
          <span
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
            className="tab-close"
          >
            ×
          </span>
        </div>
      ))}
      <button onClick={onAddTab} className="add-tab-button">
        +
      </button>
    </div>
  );
}

export default TabBar;
