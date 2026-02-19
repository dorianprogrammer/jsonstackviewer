import React, { useState, useEffect, useRef } from "react";

function TabSearch({ tabs, activeTabId, onSelectTab, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const filteredTabs = tabs.filter((tab) => tab.name.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();

    if (key === "escape") {
      onClose();
    } else if (key === "arrowdown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredTabs.length - 1));
    } else if (key === "arrowup") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (key === "enter" && filteredTabs[selectedIndex]) {
      onSelectTab(filteredTabs[selectedIndex].id);
    }
  };

  return (
    <div className="tab-search-overlay" onClick={onClose}>
      <div className="tab-search-modal" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search tabs... (Type to filter)"
          className="tab-search-input"
        />
        <div className="tab-search-results">
          {filteredTabs.length > 0 ? (
            filteredTabs.map((tab, index) => (
              <div
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`tab-search-item ${index === selectedIndex ? "selected" : ""} ${tab.id === activeTabId ? "active" : ""}`}
              >
                <span className="tab-search-name">{tab.name}</span>
                {tab.id === activeTabId && <span className="tab-search-badge">Active</span>}
              </div>
            ))
          ) : (
            <div className="tab-search-empty">No tabs found</div>
          )}
        </div>
        <div className="tab-search-footer">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
}

export default TabSearch;
