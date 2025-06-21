"use client";

import { useState, useEffect } from "react";
import { Document } from "./DocumentEditor";
import { Editor } from "@tiptap/react";
import {
  Download,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link,
} from "lucide-react";

interface TopBarProps {
  activeDocument: Document | null;
  onFormatText?: (format: string) => void;
}

export function TopBar({ activeDocument, onFormatText }: TopBarProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  // Get editor instance from the Editor component
  useEffect(() => {
    const getEditor = () => {
      const event = new CustomEvent("getEditor", {
        detail: {
          callback: (editorInstance: Editor) => {
            setEditor(editorInstance);
          },
        },
      });
      document.dispatchEvent(event);
    };

    // Try to get editor after a short delay to ensure it's mounted
    const timeout = setTimeout(getEditor, 100);
    return () => clearTimeout(timeout);
  }, [activeDocument]);

  // Update active formats when editor selection changes
  useEffect(() => {
    if (!editor) return;

    const updateActiveFormats = () => {
      const formats = new Set<string>();

      if (editor.isActive("heading", { level: 1 })) formats.add("h1");
      if (editor.isActive("heading", { level: 2 })) formats.add("h2");
      if (editor.isActive("heading", { level: 3 })) formats.add("h3");
      if (editor.isActive("bold")) formats.add("bold");
      if (editor.isActive("italic")) formats.add("italic");
      if (editor.isActive("bulletList")) formats.add("bullet");
      if (editor.isActive("orderedList")) formats.add("numbered");
      if (editor.isActive("blockquote")) formats.add("quote");
      if (editor.isActive("code")) formats.add("code");
      if (editor.isActive("link")) formats.add("link");

      setActiveFormats(formats);
    };

    // Update initially
    updateActiveFormats();

    // Listen for selection changes
    editor.on("selectionUpdate", updateActiveFormats);
    editor.on("transaction", updateActiveFormats);

    return () => {
      editor.off("selectionUpdate", updateActiveFormats);
      editor.off("transaction", updateActiveFormats);
    };
  }, [editor]);

  const handleSave = () => {
    if (!activeDocument) return;

    // Create a blob with the document content
    const blob = new Blob([activeDocument.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    // Create a download link
    const a = document.createElement("a");
    a.href = url;
    a.download = activeDocument.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFormat = (format: string) => {
    if (onFormatText) {
      onFormatText(format);
    }
  };

  const formatButtons = [
    { icon: Heading1, format: "h1", tooltip: "Heading 1" },
    { icon: Heading2, format: "h2", tooltip: "Heading 2" },
    { icon: Heading3, format: "h3", tooltip: "Heading 3" },
    { icon: Bold, format: "bold", tooltip: "Bold" },
    { icon: Italic, format: "italic", tooltip: "Italic" },
    { icon: List, format: "bullet", tooltip: "Bullet List" },
    { icon: ListOrdered, format: "numbered", tooltip: "Numbered List" },
    { icon: Quote, format: "quote", tooltip: "Quote" },
    { icon: Code, format: "code", tooltip: "Code" },
    { icon: Link, format: "link", tooltip: "Link" },
  ];

  return (
    <div className="bg-gray-800/40">
      {/* Title bar */}
      <div className="h-14 flex items-center px-4 border-b border-gray-700/30">
        <div className="flex-1">
          {activeDocument ? (
            <span className="text-base font-medium text-gray-200">
              {activeDocument.name}
            </span>
          ) : (
            <span className="text-base text-gray-500">
              No document selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={!activeDocument}
            className="p-2 hover:bg-gray-700/50 rounded text-gray-400 hover:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Download document"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formatting toolbar */}
      {activeDocument && (
        <div className="h-12 flex items-center px-4 gap-1">
          {formatButtons.map(({ icon: Icon, format, tooltip }) => (
            <button
              key={format}
              onClick={() => handleFormat(format)}
              className={`p-2 rounded transition-colors ${
                activeFormats.has(format)
                  ? "bg-blue-600/80 text-blue-100 hover:bg-blue-600"
                  : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-100"
              }`}
              title={tooltip}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
