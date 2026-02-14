import React, { useState, useEffect, useRef } from 'react';

function JsonTree({ data, level = 0, onStructureChange, expandAll, collapseAll, searchQuery = '', caseSensitive = false, exactMatch = false }) {
  const [collapsed, setCollapsed] = useState({});
  const [allPaths, setAllPaths] = useState([]);
  const lastExpandAll = useRef(0);
  const lastCollapseAll = useRef(0);

  // Collect all paths when component mounts or data changes
  useEffect(() => {
    const paths = [];
    if (typeof data === 'object' && data !== null) {
      paths.push('root.root');
    }
    collectPaths(data, 'root.root', paths);
    setAllPaths(paths);
  }, [data]);

  const collectPaths = (obj, currentPath, paths) => {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const newPath = `${currentPath}.${index}`;
          if (typeof item === 'object' && item !== null) {
            paths.push(newPath);
            collectPaths(item, newPath, paths);
          }
        });
      } else {
        Object.keys(obj).forEach(key => {
          const newPath = `${currentPath}.${key}`;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            paths.push(newPath);
            collectPaths(obj[key], newPath, paths);
          }
        });
      }
    }
  };

  useEffect(() => {
    if (expandAll > 0 && expandAll !== lastExpandAll.current) {
      lastExpandAll.current = expandAll;
      setCollapsed({});
      if (onStructureChange) {
        setTimeout(() => onStructureChange(), 100);
      }
    }
  }, [expandAll, onStructureChange]);

  useEffect(() => {
    if (collapseAll > 0 && collapseAll !== lastCollapseAll.current) {
      lastCollapseAll.current = collapseAll;
      const newCollapsed = {};
      allPaths.forEach(path => {
        newCollapsed[path] = true;
      });
      setCollapsed(newCollapsed);
      if (onStructureChange) {
        setTimeout(() => onStructureChange(), 100);
      }
    }
  }, [collapseAll, allPaths, onStructureChange]);

  const toggleCollapse = (key) => {
    setCollapsed(prev => {
      const newState = {
        ...prev,
        [key]: !prev[key]
      };
      if (onStructureChange) {
        setTimeout(() => onStructureChange(), 0);
      }
      return newState;
    });
  };

  // Helper to highlight search matches
  const highlightText = (text, isKey = false) => {
    if (!searchQuery || searchQuery.trim() === '') {
      return text;
    }

    const textStr = String(text);
    let query = searchQuery;
    let textToSearch = textStr;

    // Apply case sensitivity
    if (!caseSensitive) {
      query = query.toLowerCase();
      textToSearch = textStr.toLowerCase();
    }

    // Check for exact match
    if (exactMatch) {
      if (textToSearch === query) {
        return (
          <mark className="search-highlight">
            {textStr}
          </mark>
        );
      }
      return textStr;
    }

    // Partial match
    if (!textToSearch.includes(query)) {
      return textStr;
    }

    const parts = [];
    let lastIndex = 0;
    let index = textToSearch.indexOf(query);

    while (index !== -1) {
      if (index > lastIndex) {
        parts.push(textStr.substring(lastIndex, index));
      }
      parts.push(
        <mark key={`${index}-${lastIndex}`} className="search-highlight">
          {textStr.substring(index, index + query.length)}
        </mark>
      );
      lastIndex = index + query.length;
      index = textToSearch.indexOf(query, lastIndex);
    }

    if (lastIndex < textStr.length) {
      parts.push(textStr.substring(lastIndex));
    }

    return parts;
  };

  const renderValue = (key, value, path, showKey = true) => {
    const fullPath = `${path}.${key}`;

    if (value === null) {
      return <span className="json-null">null</span>;
    }

    if (typeof value === 'boolean') {
      return <span className="json-boolean">{highlightText(value.toString())}</span>;
    }

    if (typeof value === 'number') {
      return <span className="json-number">{highlightText(value)}</span>;
    }

    if (typeof value === 'string') {
      return <span className="json-string">"{highlightText(value)}"</span>;
    }

    if (Array.isArray(value)) {
      const isCollapsed = collapsed[fullPath];
      return (
        <span className="json-array">
          <span 
            className="json-toggle"
            onClick={() => toggleCollapse(fullPath)}
          >
            {isCollapsed ? '▶' : '▼'}
          </span>
          <span className="json-bracket">[</span>
          {isCollapsed ? (
            <>
              <span className="json-collapsed-info">...</span>
              <span className="json-bracket">]</span>
            </>
          ) : (
            <>
              <div className="json-children">
                {value.map((item, index) => {
                  const isComplexType = typeof item === 'object' && item !== null;
                  return (
                    <div key={index} className="json-item" data-line="true">
                      {!isComplexType && <span className="json-index">{index}:</span>}
                      {renderValue(index, item, fullPath, false)}
                      {index < value.length - 1 && <span className="json-comma">,</span>}
                    </div>
                  );
                })}
              </div>
              <div className="json-item" data-line="true">
                <span className="json-bracket">]</span>
              </div>
            </>
          )}
        </span>
      );
    }

    if (typeof value === 'object') {
      const isCollapsed = collapsed[fullPath];
      const keys = Object.keys(value);
      return (
        <span className="json-object">
          <span 
            className="json-toggle"
            onClick={() => toggleCollapse(fullPath)}
          >
            {isCollapsed ? '▶' : '▼'}
          </span>
          <span className="json-bracket">{'{'}</span>
          {isCollapsed ? (
            <>
              <span className="json-collapsed-info">...</span>
              <span className="json-bracket">{'}'}</span>
            </>
          ) : (
            <>
              <div className="json-children">
                {keys.map((objKey, index) => (
                  <div key={objKey} className="json-item" data-line="true">
                    <span className="json-key">"{highlightText(objKey, true)}":</span>
                    {renderValue(objKey, value[objKey], fullPath)}
                    {index < keys.length - 1 && <span className="json-comma">,</span>}
                  </div>
                ))}
              </div>
              <div className="json-item" data-line="true">
                <span className="json-bracket">{'}'}</span>
              </div>
            </>
          )}
        </span>
      );
    }

    return <span>{String(value)}</span>;
  };

  if (typeof data !== 'object' || data === null) {
    return (
      <div className="json-tree">
        <div className="json-item" data-line="true">
          {renderValue('root', data, 'root')}
        </div>
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div className="json-tree" data-line="true">
        {renderValue('root', data, 'root')}
      </div>
    );
  }

  return (
    <div className="json-tree" data-line="true">
      {renderValue('root', data, 'root')}
    </div>
  );
}

export default JsonTree;