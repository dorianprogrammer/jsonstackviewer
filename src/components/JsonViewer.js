import React, { useEffect, useRef, useState } from "react";
import JsonTree from "./JsonTree";
import { ArrowUp } from "lucide-react";

function JsonViewer({ content, isValid, error }) {
  const treeRef = useRef(null);
  const searchInputRef = useRef(null);
  const viewerContainerRef = useRef(null);
  const [lineCount, setLineCount] = useState(1);
  const [expandTrigger, setExpandTrigger] = useState(0);
  const [collapseTrigger, setCollapseTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [exactMatch, setExactMatch] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const updateLineCount = () => {
    if (treeRef.current) {
      setTimeout(() => {
        const lines = treeRef.current.querySelectorAll('[data-line="true"]');
        setLineCount(lines.length);
      }, 200);
    }
  };

  useEffect(() => {
    updateLineCount();

    if (treeRef.current) {
      const observer = new MutationObserver(() => {
        updateLineCount();
      });

      observer.observe(treeRef.current, {
        childList: true,
        subtree: true,
        attributes: false,
      });

      return () => observer.disconnect();
    }
  }, [content, isValid]);

  // Track scroll position for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (viewerContainerRef.current) {
        setShowScrollTop(viewerContainerRef.current.scrollTop > 200);
      }
    };

    const container = viewerContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Count matches and update when search changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      setTimeout(() => {
        const matches = document.querySelectorAll(".search-highlight");
        setTotalMatches(matches.length);
        setCurrentMatchIndex(matches.length > 0 ? 1 : 0);
      }, 100);
    } else {
      setTotalMatches(0);
      setCurrentMatchIndex(0);
    }
  }, [searchQuery, caseSensitive, exactMatch]);

  // Navigate to specific match
  const scrollToMatch = (index) => {
    setTimeout(() => {
      const matches = document.querySelectorAll(".search-highlight");
      if (matches.length > 0 && index >= 0 && index < matches.length) {
        // Remove active class from all matches
        matches.forEach((match) => match.classList.remove("search-highlight-active"));

        // Add active class to current match
        matches[index].classList.add("search-highlight-active");

        // Scroll to match
        matches[index].scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setCurrentMatchIndex(index + 1);
      }
    }, 100);
  };

  // Handle Enter key to navigate matches
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (totalMatches > 0) {
        const nextIndex = currentMatchIndex % totalMatches;
        scrollToMatch(nextIndex);
      }
    }
  };

  // Navigate to next match
  const handleNextMatch = () => {
    if (totalMatches > 0) {
      const nextIndex = currentMatchIndex % totalMatches;
      scrollToMatch(nextIndex);
    }
  };

  // Navigate to previous match
  const handlePrevMatch = () => {
    if (totalMatches > 0) {
      const prevIndex = (currentMatchIndex - 2 + totalMatches) % totalMatches;
      scrollToMatch(prevIndex);
    }
  };

  // Scroll to first match when search query changes
  useEffect(() => {
    if (searchQuery && searchQuery.trim() !== "") {
      scrollToMatch(0);
    }
  }, [searchQuery, caseSensitive, exactMatch]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 0);
      }
      // ESC to close search
      if (e.key === "Escape" && showSearch) {
        setShowSearch(false);
        setSearchQuery("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSearch]);

  const handleExpandAll = () => {
    setExpandTrigger((prev) => prev + 1);
  };

  const handleCollapseAll = () => {
    setCollapseTrigger((prev) => prev + 1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setSearchQuery("");
    setCaseSensitive(false);
    setExactMatch(false);
  };

  const scrollToTop = () => {
    if (viewerContainerRef.current) {
      viewerContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const renderJson = () => {
    if (!content.trim()) {
      return <div className="json-viewer-empty">No JSON to display</div>;
    }

    if (!isValid) {
      return (
        <div className="json-viewer-error">
          <h4>Invalid JSON</h4>
          <p>{error}</p>
        </div>
      );
    }

    try {
      const parsed = JSON.parse(content);
      return (
        <>
          <div className="json-viewer-controls">
            <button onClick={handleExpandAll} className="control-button">
              Expand All
            </button>
            <button onClick={handleCollapseAll} className="control-button">
              Collapse All
            </button>
            {showSearch && (
              <div className="search-container">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search... (Ctrl+F)"
                  className="search-input"
                />
                <div className="search-options">
                  <button
                    onClick={() => setCaseSensitive(!caseSensitive)}
                    className={`search-option-button ${caseSensitive ? "active" : ""}`}
                    title="Case Sensitive"
                  >
                    Aa
                  </button>
                  <button
                    onClick={() => setExactMatch(!exactMatch)}
                    className={`search-option-button ${exactMatch ? "active" : ""}`}
                    title="Exact Match"
                  >
                    ["]
                  </button>
                </div>
                {totalMatches > 0 && (
                  <div className="search-navigation">
                    <span className="match-count">
                      {currentMatchIndex}/{totalMatches}
                    </span>
                    <button onClick={handlePrevMatch} className="nav-button" title="Previous (Shift+Enter)">
                      ↑
                    </button>
                    <button onClick={handleNextMatch} className="nav-button" title="Next (Enter)">
                      ↓
                    </button>
                  </div>
                )}
                <button onClick={handleSearchClose} className="search-close">
                  ×
                </button>
              </div>
            )}
            {!showSearch && (
              <button onClick={() => setShowSearch(true)} className="control-button">
                🔍 Search
              </button>
            )}
          </div>
          <div className="json-viewer-with-lines" ref={viewerContainerRef}>
            <div className="json-line-numbers">
              {Array.from({ length: lineCount }, (_, i) => (
                <div key={i} className="line-number">
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="json-tree-content" ref={treeRef}>
              <JsonTree
                data={parsed}
                onStructureChange={updateLineCount}
                expandAll={expandTrigger}
                collapseAll={collapseTrigger}
                searchQuery={searchQuery}
                caseSensitive={caseSensitive}
                exactMatch={exactMatch}
              />
            </div>
          </div>
          {showScrollTop && (
            <button onClick={scrollToTop} className="scroll-to-top" title="Back to top">
              <ArrowUp size={20} />
            </button>
          )}
        </>
      );
    } catch (e) {
      return (
        <div className="json-viewer-error">
          <h4>Error parsing JSON</h4>
          <p>{e.message}</p>
        </div>
      );
    }
  };

  return <div className="json-viewer">{renderJson()}</div>;
}

export default JsonViewer;
