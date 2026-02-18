import React, { useState, useEffect } from "react";
import TabBar from "./components/TabBar";
import Tab from "./components/Tab";
import TabSearch from "./components/TabSearch";
import "./styles/App.css";

function App() {
  const [tabs, setTabs] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);
  const [showTabSearch, setShowTabSearch] = useState(false);

  const migrateTabs = (loadedTabs) =>
    loadedTabs.map((t) => {
      if (t.files && Array.isArray(t.files)) return t;
      const initialFile =
        t.content && t.content.trim().length > 0
          ? { id: Date.now().toString() + Math.random(), name: "data.json", content: t.content }
          : null;
      return {
        id: t.id,
        name: t.name,
        files: initialFile ? [initialFile] : [],
        activeFileId: initialFile ? initialFile.id : null,
      };
    });

  useEffect(() => {
    const loadTabs = async () => {
      const savedTabs = await window.electronAPI.loadTabs();
      const migrated = migrateTabs(savedTabs || []);
      if (migrated.length > 0) {
        setTabs(migrated);
        setActiveTabId(migrated[0].id);
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        addNewTab();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "w") {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setShowTabSearch(true);
      }
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
      files: [],
      activeFileId: null,
    };
    setTabs((prev) => [...prev, newTab]);
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

  const renameTab = (tabId, newName) => {
    setTabs((prev) => prev.map((tab) => (tab.id === tabId ? { ...tab, name: newName } : tab)));
  };

  const handleTabSelect = (tabId) => {
    setActiveTabId(tabId);
    setShowTabSearch(false);
  };

  const onUpdateTab = (tabId, patch) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...patch } : t)));
  };

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  return (
    <div className="app-container">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabClick={handleTabSelect}
        onTabClose={closeTab}
        onAddTab={addNewTab}
        onTabRename={renameTab}
      />
      {activeTab && (
        <div className="tab-content">
          <Tab tab={activeTab} onUpdateTab={onUpdateTab} />
        </div>
      )}
      {showTabSearch && (
        <TabSearch tabs={tabs} activeTabId={activeTabId} onSelectTab={handleTabSelect} onClose={() => setShowTabSearch(false)} />
      )}
    </div>
  );
}

export default App;