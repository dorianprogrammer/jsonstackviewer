import React, { useState, useEffect } from "react";
import TabBar from "./components/TabBar";
import Tab from "./components/Tab";
import TabSearch from "./components/TabSearch";
import "./styles/App.css";

function App() {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [showTabSearch, setShowTabSearch] = useState(false);

  useEffect(() => {
    const loadTabs = async () => {
      const savedTabs = await window.electronAPI.loadTabs();
      if (savedTabs.length > 0) {
        setTabs(savedTabs);
        setActiveTabId(savedTabs[0].id);
      } else {
        addNewTab();
      }
    };
    loadTabs();
  }, []);

  useEffect(() => {
    if (tabs.length > 0) {
      window.electronAPI.saveTabs(tabs);
    }
  }, [tabs]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+T or Cmd+T - New tab
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        addNewTab();
      }

      // Ctrl+W or Cmd+W - Close active tab
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        if (activeTabId) {
          closeTab(activeTabId);
        }
      }

      // Ctrl+P or Cmd+P - Tab search
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setShowTabSearch(true);
      }

      // ESC - Close tab search
      if (e.key === "Escape" && showTabSearch) {
        setShowTabSearch(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeTabId, showTabSearch]);

  const addNewTab = () => {
    const newTab = {
      id: Date.now().toString(),
      name: `Tab ${tabs.length + 1}`,
      content: "{\n  \n}",
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
  };

  const closeTab = (tabId) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    if (tabId === activeTabId && newTabs.length > 0) {
      if (currentIndex < newTabs.length) {
        setActiveTabId(newTabs[currentIndex].id);
      } else {
        setActiveTabId(newTabs[currentIndex - 1].id);
      }
    }
  };

  const updateTabContent = (tabId, content) => {
    setTabs(tabs.map((tab) => (tab.id === tabId ? { ...tab, content } : tab)));
  };

  const renameTab = (tabId, newName) => {
    setTabs(tabs.map((tab) => (tab.id === tabId ? { ...tab, name: newName } : tab)));
  };

  const handleTabSelect = (tabId) => {
    setActiveTabId(tabId);
    setShowTabSearch(false);
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="app-container">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={setActiveTabId}
        onTabClose={closeTab}
        onAddTab={addNewTab}
        onTabRename={renameTab}
      />

      <div className="tab-content">
        {activeTab ? (
          <Tab tab={activeTab} onContentChange={updateTabContent} />
        ) : (
          <div className="no-tabs-message">No tabs open</div>
        )}
      </div>

      {showTabSearch && (
        <TabSearch
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={handleTabSelect}
          onClose={() => setShowTabSearch(false)}
        />
      )}
    </div>
  );
}

export default App;
