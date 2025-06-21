"use client";

import { useState } from "react";
import { Document } from "./DocumentEditor";
import {
  ChevronRight,
  ChevronDown,
  File,
  FolderOpen,
  Folder,
  Plus,
  Trash2,
} from "lucide-react";

interface FileTreeProps {
  documents: Document[];
  activeDocument: Document | null;
  onSelectDocument: (doc: Document) => void;
  onCreateDocument: (name: string, parentId?: string) => void;
  onDeleteDocument: (id: string) => void;
}

export function FileTree({
  documents,
  activeDocument,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
}: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateDocument = () => {
    if (newFileName.trim()) {
      onCreateDocument(newFileName.trim());
      setNewFileName("");
      setIsCreating(false);
    }
  };

  const renderDocument = (doc: Document, depth = 0) => {
    const isFolder = doc.type === "folder";
    const isExpanded = expandedFolders.has(doc.id);
    const isActive = activeDocument?.id === doc.id;

    return (
      <div key={doc.id}>
        <div
          className={`flex items-center px-2 py-1.5 hover:bg-gray-700/50 cursor-pointer group rounded-md transition-colors ${
            isActive ? "bg-gray-700/70 text-white" : "text-gray-300"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(doc.id);
            } else {
              onSelectDocument(doc);
            }
          }}
        >
          {isFolder ? (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-1 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1 text-gray-400" />
            )
          ) : (
            <div className="w-4 mr-1" />
          )}
          {isFolder ? (
            isExpanded ? (
              <FolderOpen className="w-4 h-4 mr-2 text-blue-400" />
            ) : (
              <Folder className="w-4 h-4 mr-2 text-blue-400" />
            )
          ) : (
            <File className="w-4 h-4 mr-2 text-gray-400" />
          )}
          <span className="text-sm flex-1">{doc.name}</span>
          <button
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-600/50 rounded transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDocument(doc.id);
            }}
          >
            <Trash2 className="w-3 h-3 text-gray-400" />
          </button>
        </div>
        {isFolder &&
          isExpanded &&
          doc.children?.map((child) => renderDocument(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="">
        {documents.map((doc) => renderDocument(doc))}
        {isCreating ? (
          <div className="flex items-center px-2 py-1.5 mt-1">
            <File className="w-4 h-4 mr-2 text-gray-400" />
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleCreateDocument();
                } else if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewFileName("");
                }
              }}
              onBlur={handleCreateDocument}
              className="flex-1 bg-gray-700/50 border border-gray-600 rounded px-2 py-1 outline-none text-sm text-white"
              placeholder="New file name..."
              autoFocus
            />
          </div>
        ) : (
          <button
            className="flex items-center px-2 py-1.5 w-full hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 rounded-md transition-colors mt-1"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm">New File</span>
          </button>
        )}
      </div>
    </div>
  );
}
