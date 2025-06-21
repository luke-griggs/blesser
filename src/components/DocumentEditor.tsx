"use client";

import { useState, useEffect } from "react";
import { FileTree } from "@/components/FileTree";
import { Editor } from "@/components/Editor";
import { TopBar } from "@/components/TopBar";

export interface Document {
  id: string;
  name: string;
  content: string;
  type: "file" | "folder";
  children?: Document[];
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function DocumentEditor() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeDocument, setActiveDocument] = useState<Document | null>(null);

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem("documents");
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    } else {
      // Initialize with a welcome document
      const welcomeDoc: Document = {
        id: "1",
        name: "Welcome.md",
        content:
          "# Welcome to Document Editor\n\nStart writing your documents here.",
        type: "file",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDocuments([welcomeDoc]);
      setActiveDocument(welcomeDoc);
    }
  }, []);

  // Save documents to localStorage whenever they change
  useEffect(() => {
    if (documents.length > 0) {
      localStorage.setItem("documents", JSON.stringify(documents));
    }
  }, [documents]);

  const updateDocument = (id: string, content: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id ? { ...doc, content, updatedAt: new Date() } : doc
      )
    );
    if (activeDocument?.id === id) {
      setActiveDocument((prev) =>
        prev ? { ...prev, content, updatedAt: new Date() } : null
      );
    }
  };

  const createDocument = (name: string, parentId?: string) => {
    const newDoc: Document = {
      id: Date.now().toString(),
      name,
      content: "",
      type: "file",
      parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocument(newDoc);
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    if (activeDocument?.id === id) {
      setActiveDocument(null);
    }
  };

  const handleFormatText = (format: string) => {
    // This will be passed to the Editor component through a ref or callback
    const event = new CustomEvent("formatText", { detail: { format } });
    document.dispatchEvent(event);
  };

  return (
    <div className="h-screen bg-gray-800/40 relative overflow-hidden">
      {/* Sidebar - always visible */}
      <div className="absolute left-0 top-0 bottom-0 w-80 p-6">
        <div className="h-full flex flex-col">
          <div className="mb-4">
            <h1 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Explorer
            </h1>
          </div>
          <FileTree
            documents={documents}
            activeDocument={activeDocument}
            onSelectDocument={setActiveDocument}
            onCreateDocument={createDocument}
            onDeleteDocument={deleteDocument}
          />
        </div>
      </div>

      {/* Text editor card */}
      <div className="absolute top-4 bottom-4 right-4 left-80 bg-gray-800/40 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <TopBar
          activeDocument={activeDocument}
          onFormatText={handleFormatText}
        />
        {activeDocument ? (
          <Editor
            document={activeDocument}
            onChange={(content) => updateDocument(activeDocument.id, content)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a document to start editing</p>
          </div>
        )}
      </div>
    </div>
  );
}
