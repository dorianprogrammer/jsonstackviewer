import React, { useState, useEffect, useRef } from "react";

function TabSearch({ tabs, activeTabId, onSelectTab, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filter tabs based on search query
  const filteredTabs = tabs.filter((tab) => tab.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredTabs.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredTabs.length > 0) {
        onSelectTab(filteredTabs[selectedIndex].id);
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleTabClick = (tabId) => {
    onSelectTab(tabId);
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
                onClick={() => handleTabClick(tab.id)}
                className={`tab-search-item ${
                  index === selectedIndex ? "selected" : ""
                } ${tab.id === activeTabId ? "active" : ""}`}
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
