import React from 'react';

function JsonEditor({ content, onChange, onValidation }) {
  const handleChange = (e) => {
    const newContent = e.target.value;
    onChange(newContent);
    
    // Validate JSON
    try {
      if (newContent.trim()) {
        JSON.parse(newContent);
        onValidation(true, null);
      } else {
        onValidation(true, null); // Empty is valid
      }
    } catch (error) {
      onValidation(false, error.message);
    }
  };

  return (
    <textarea
      value={content}
      onChange={handleChange}
      className="json-editor"
      placeholder="Enter JSON here..."
    />
  );
}

export default JsonEditor;