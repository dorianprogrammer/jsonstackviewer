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
          ? { id: crypto.randomUUID(), name: "data.json", content: t.content }
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
        const newTab = { id: crypto.randomUUID(), name: "Tab 1", files: [], activeFileId: null };
        setTabs([newTab]);
        setActiveTabId(newTab.id);
      }
    };
    loadTabs();
  }, []);

  useEffect(() => {
    if (tabs.length > 0) {
      window.electronAPI.saveTabs(tabs);
    }
  }, [tabs]);

  const generateJsonFileName = (parsed) => {
    const now = new Date();
    const timestamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      "_",
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0"),
      String(now.getSeconds()).padStart(2, "0"),
    ].join("");

    // Try to derive a meaningful name from the JSON structure
    if (Array.isArray(parsed)) {
      return `array_${timestamp}.json`;
    }
    if (typeof parsed === "object" && parsed !== null) {
      const topKey = Object.keys(parsed)[0];
      if (topKey) {
        const slug = topKey
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "_")
          .slice(0, 24);
        return `${slug}_${timestamp}.json`;
      }
    }
    return `paste_${timestamp}.json`;
  };

  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Ignore Ctrl+V when the user is typing in an input, textarea, or Monaco
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isEditable = document.activeElement?.isContentEditable;
      const isMonaco = document.activeElement?.closest?.(".editor-host");
      if (tag === "input" || tag === "textarea" || isEditable || isMonaco) {
        // Let normal paste through — only intercept when focus is on the app shell
        if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
          // Still allow the event to proceed normally
        }
      } else if ((e.ctrlKey || e.metaKey) && e.code === "KeyV") {
        e.preventDefault();
        try {
          const text = await navigator.clipboard.readText();
          const trimmed = text.trim();
          if (!trimmed) return;
          const parsed = JSON.parse(trimmed); // throws if not valid JSON
          const formatted = JSON.stringify(parsed, null, 2);
          const name = generateJsonFileName(parsed);
          const newFile = { id: crypto.randomUUID(), name, content: formatted };
          setTabs((prev) =>
            prev.map((t) =>
              t.id === activeTabId ? { ...t, files: [...t.files, newFile], activeFileId: newFile.id } : t,
            ),
          );
        } catch {
          // Clipboard content is not valid JSON — ignore silently
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.code === "KeyT") {
        e.preventDefault();
        addNewTab();
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyW") {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyP") {
        e.preventDefault();
        setShowTabSearch(true);
      }
      if (e.code === "Escape" && showTabSearch) {
        setShowTabSearch(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tabs, activeTabId, showTabSearch]);

  const addNewTab = () => {
    const newTab = {
      id: crypto.randomUUID(),
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
      const nextIndex = currentIndex < newTabs.length ? currentIndex : currentIndex - 1;
      setActiveTabId(newTabs[nextIndex].id);
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
      <div className="tab-content">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{ display: tab.id === activeTabId ? "flex" : "none", width: "100%", height: "100%" }}
          >
            <Tab tab={tab} onUpdateTab={onUpdateTab} />
          </div>
        ))}
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
