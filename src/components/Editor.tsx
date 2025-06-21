"use client";

import { useEffect, useRef } from "react";
import { Document } from "./DocumentEditor";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import {
  defaultMarkdownParser,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";
import Link from "@tiptap/extension-link";

interface EditorProps {
  document: Document;
  onChange: (content: string) => void;
}

export function Editor({ document, onChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Configure the heading extension to use markdown syntax
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        // Enable markdown-style formatting while typing
        code: {
          HTMLAttributes: {
            class: "bg-gray-700/50 text-yellow-300 px-1 py-0.5 rounded text-sm",
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-gray-700/50 p-3 rounded my-2 overflow-x-auto",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-gray-500 pl-4 my-2 text-gray-300 italic",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "my-2",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "my-2",
          },
        },
      }),
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-400 underline hover:text-blue-300",
        },
      }),
      Placeholder.configure({
        placeholder: "Start typing...",
        emptyEditorClass: "is-empty",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none focus:outline-none p-4 h-full text-gray-100",
        style: "min-height: 100%; line-height: 1.5;",
      },
    },
    onUpdate: ({ editor }) => {
      // Convert editor content to markdown and call onChange
      const markdown = editorContentToMarkdown(editor.getJSON());
      onChange(markdown);
    },
    parseOptions: {
      preserveWhitespace: "full",
    },
  });

  // Convert Tiptap JSON to markdown
  const editorContentToMarkdown = (
    content: Record<string, unknown>
  ): string => {
    if (!content || !content.content) return "";

    try {
      // Create a ProseMirror document from the JSON
      const doc = defaultMarkdownParser.schema.nodeFromJSON(content);
      // Serialize to markdown
      return defaultMarkdownSerializer.serialize(doc);
    } catch {
      // Fallback: extract text content if serialization fails
      return extractTextFromContent(content);
    }
  };

  // Fallback text extraction
  const extractTextFromContent = (content: unknown): string => {
    if (!content) return "";

    if (typeof content === "string") return content;

    const contentObj = content as Record<string, unknown>;
    if (contentObj.text && typeof contentObj.text === "string")
      return contentObj.text;

    if (contentObj.content && Array.isArray(contentObj.content)) {
      return contentObj.content
        .map((node: unknown) => extractTextFromContent(node))
        .join("");
    }

    return "";
  };

  // Convert markdown to Tiptap content
  const markdownToEditorContent = (markdown: string) => {
    if (!markdown.trim()) return "";

    try {
      // Parse markdown to ProseMirror document
      const doc = defaultMarkdownParser.parse(markdown);
      // Convert to JSON that Tiptap can use
      return doc?.toJSON() || "";
    } catch {
      // Fallback: treat as plain text
      return markdown;
    }
  };

  // Update editor content when document changes
  useEffect(() => {
    if (editor && document.content !== undefined) {
      const currentContent = editorContentToMarkdown(editor.getJSON());

      // Only update if content actually changed to avoid cursor jumps
      if (currentContent !== document.content) {
        const editorContent = markdownToEditorContent(document.content);
        editor.commands.setContent(editorContent, false);
      }
    }
  }, [document.content, editor]);

  // Handle toolbar commands
  useEffect(() => {
    const handleFormatText = (event: CustomEvent) => {
      if (!editor) return;

      const { format } = event.detail;

      switch (format) {
        case "h1":
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          break;
        case "h2":
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          break;
        case "h3":
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          break;
        case "bold":
          editor.chain().focus().toggleBold().run();
          break;
        case "italic":
          editor.chain().focus().toggleItalic().run();
          break;
        case "bullet":
          editor.chain().focus().toggleBulletList().run();
          break;
        case "numbered":
          editor.chain().focus().toggleOrderedList().run();
          break;
        case "quote":
          editor.chain().focus().toggleBlockquote().run();
          break;
        case "code":
          editor.chain().focus().toggleCode().run();
          break;
        case "link":
          const url = window.prompt("Enter URL:");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
          break;
        default:
          break;
      }
    };

    window.document.addEventListener(
      "formatText",
      handleFormatText as EventListener
    );

    return () => {
      window.document.removeEventListener(
        "formatText",
        handleFormatText as EventListener
      );
    };
  }, [editor]);

  // Share editor instance with TopBar for active state checking
  useEffect(() => {
    const handleGetEditor = (event: CustomEvent) => {
      event.detail.callback(editor);
    };

    window.document.addEventListener(
      "getEditor",
      handleGetEditor as EventListener
    );

    return () => {
      window.document.removeEventListener(
        "getEditor",
        handleGetEditor as EventListener
      );
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-gray-800/40 relative">
      {/* Tiptap Editor - Now full width */}
      <div className="flex-1 relative" ref={editorRef}>
        <EditorContent editor={editor} className="h-full" />
      </div>

      <style jsx global>{`
        .ProseMirror {
          outline: none !important;
          height: 100%;
          overflow-y: auto;
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 0.5rem 0;
          color: #f3f4f6;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.4rem 0;
          color: #f3f4f6;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.3rem 0;
          color: #f3f4f6;
        }

        .ProseMirror p {
          margin: 0.25rem 0;
          color: #f3f4f6;
        }

        .ProseMirror strong {
          font-weight: bold;
          color: #f3f4f6;
        }

        .ProseMirror em {
          font-style: italic;
          color: #f3f4f6;
        }

        .ProseMirror ul {
          color: #f3f4f6;
          list-style-type: disc;
          list-style-position: outside;
          margin-left: 1.5rem;
        }

        .ProseMirror ol {
          color: #f3f4f6;
          list-style-type: decimal;
          list-style-position: outside;
          margin-left: 1.5rem;
        }

        .ProseMirror ul li,
        .ProseMirror ol li {
          margin: 0.25rem 0;
          padding-left: 0.5rem;
          color: #f3f4f6;
          cursor: text;
        }

        .ProseMirror ul li::marker,
        .ProseMirror ol li::marker {
          color: #f3f4f6;
        }

        .ProseMirror a {
          color: #60a5fa;
          text-decoration: underline;
        }

        .ProseMirror a:hover {
          color: #93c5fd;
        }

        .ProseMirror.is-empty::before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
        }

        .ProseMirror code {
          background-color: rgba(55, 65, 81, 0.5);
          color: #fbbf24;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: ui-monospace, SFMono-Regular, Consolas, Liberation Mono,
            Menlo, monospace;
        }

        .ProseMirror pre {
          background-color: rgba(55, 65, 81, 0.5);
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: transparent;
          padding: 0;
          color: #f3f4f6;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #6b7280;
          padding-left: 1rem;
          margin: 0.5rem 0;
          color: #d1d5db;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
