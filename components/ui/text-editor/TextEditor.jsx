"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import {
  LuBold,
  LuItalic,
  LuUnderline,
  LuStrikethrough,
  LuCode,
  LuHeading1,
  LuHeading2,
  LuHeading3,
  LuList,
  LuListOrdered,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuAlignJustify,
  LuLink,
  LuImage,
  LuUndo,
  LuRedo,
  LuQuote,
  LuSeparatorHorizontal,
  LuHighlighter,
  LuX,
  LuCheck,
  LuPalette,
  LuChevronDown,
  LuText,
  LuType,
} from "react-icons/lu";

// Improved ResizableImage extension with better cursor following and toolbar positioning
const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: (element) => element.getAttribute("height"),
        renderHTML: (attributes) => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
      },
      alignment: {
        default: "left", // Changed default from center to left
        parseHTML: (element) => element.getAttribute("data-alignment"),
        renderHTML: (attributes) => {
          if (!attributes.alignment) {
            return {};
          }
          return { "data-alignment": attributes.alignment };
        },
      },
    };
  },
  addNodeView() {
    return ({ node, editor, getPos }) => {
      // Create wrapper
      const dom = document.createElement("div");
      dom.classList.add("image-container");

      if (node.attrs.alignment) {
        dom.setAttribute("data-alignment", node.attrs.alignment);
      }

      // Create image element
      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.alt = node.attrs.alt || "";
      if (node.attrs.width) img.width = node.attrs.width;
      if (node.attrs.height) img.height = node.attrs.height;

      // Create resize handles container
      const resizeHandles = document.createElement("div");
      resizeHandles.classList.add("resize-handles");

      // Add resize handles
      const positions = [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ];
      const handles = {};

      positions.forEach((position) => {
        const handle = document.createElement("div");
        handle.classList.add("resize-handle", `resize-handle-${position}`);
        resizeHandles.appendChild(handle);
        handles[position] = handle;
      });

      // Create toolbar
      const toolbar = document.createElement("div");
      toolbar.classList.add("image-toolbar");

      // Add alignment buttons
      const alignments = [
        {
          value: "left",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></svg>',
        },
        {
          value: "center",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="18" x2="6" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>',
        },
        {
          value: "right",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>',
        },
      ];

      alignments.forEach(({ value, icon }) => {
        const button = document.createElement("button");
        button.classList.add("alignment-button");
        button.setAttribute("data-alignment", value);
        button.innerHTML = icon;
        button.title = `Align ${value}`;

        if (node.attrs.alignment === value) {
          button.classList.add("active");
        }

        button.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (typeof getPos === "function" && editor) {
            editor.commands.updateAttributes("image", { alignment: value });
          }
        });

        toolbar.appendChild(button);
      });

      // Add delete button with fixed functionality
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-button");
      deleteButton.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
      deleteButton.title = "Delete image";

      // Fixed delete functionality with multiple approaches to ensure it works
      deleteButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (typeof getPos === "function" && editor) {
          // Try multiple approaches to ensure deletion works
          const pos = getPos();

          // Approach 1: Use deleteRange
          editor.commands.deleteRange({ from: pos, to: pos + node.nodeSize });

          // Approach 2: If the first approach doesn't work, try direct node deletion
          setTimeout(() => {
            if (editor.state.doc.nodeAt(pos)) {
              editor.chain().focus().deleteNode("image").run();
            }
          }, 10);
        }
      });

      // Append elements to DOM
      dom.appendChild(img);
      dom.appendChild(resizeHandles);
      dom.appendChild(toolbar);
      toolbar.appendChild(deleteButton);

      // Improved resize functionality with better cursor following
      let startWidth, startHeight, startX, startY;
      let isResizing = false;
      let activeHandle = null;

      const startResize = (e, handle) => {
        isResizing = true;
        activeHandle = handle;
        startWidth = img.width || img.naturalWidth;
        startHeight = img.height || img.naturalHeight;
        startX = e.clientX;
        startY = e.clientY;

        // Add resizing class to show all handles during resize
        dom.classList.add("resizing");

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
        e.preventDefault();
      };

      const resize = (e) => {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newWidth, newHeight;
        const aspectRatio = startWidth / startHeight;

        if (activeHandle.includes("right")) {
          newWidth = startWidth + dx;
        } else if (activeHandle.includes("left")) {
          newWidth = startWidth - dx;
        }

        if (activeHandle.includes("bottom")) {
          newHeight = startHeight + dy;
        } else if (activeHandle.includes("top")) {
          newHeight = startHeight - dy;
        }

        // Maintain aspect ratio
        if (newWidth && !newHeight) {
          newHeight = newWidth / aspectRatio;
        } else if (newHeight && !newWidth) {
          newWidth = newHeight * aspectRatio;
        }

        // Apply minimum size
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        img.width = Math.round(newWidth);
        img.height = Math.round(newHeight);

        // Update node attributes
        if (typeof getPos === "function" && editor) {
          editor.commands.updateAttributes("image", {
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          });
        }
      };

      const stopResize = () => {
        if (isResizing) {
          isResizing = false;
          dom.classList.remove("resizing");
          document.removeEventListener("mousemove", resize);
          document.removeEventListener("mouseup", stopResize);
        }
      };

      // Add event listeners to resize handles
      resizeHandles.querySelectorAll(".resize-handle").forEach((handle) => {
        const position = Array.from(handle.classList)
          .find((cls) => cls.startsWith("resize-handle-"))
          ?.replace("resize-handle-", "");

        handle.addEventListener("mousedown", (e) => startResize(e, position));
      });

      return {
        dom,
        update: (updatedNode) => {
          if (updatedNode.attrs.src !== node.attrs.src) {
            img.src = updatedNode.attrs.src;
          }

          if (updatedNode.attrs.alt !== node.attrs.alt) {
            img.alt = updatedNode.attrs.alt || "";
          }

          if (updatedNode.attrs.width !== node.attrs.width) {
            img.width = updatedNode.attrs.width;
          }

          if (updatedNode.attrs.height !== node.attrs.height) {
            img.height = updatedNode.attrs.height;
          }

          if (updatedNode.attrs.alignment !== node.attrs.alignment) {
            dom.setAttribute("data-alignment", updatedNode.attrs.alignment);

            // Update active alignment button
            toolbar.querySelectorAll(".alignment-button").forEach((button) => {
              if (
                button.getAttribute("data-alignment") ===
                updatedNode.attrs.alignment
              ) {
                button.classList.add("active");
              } else {
                button.classList.remove("active");
              }
            });
          }
        },
        destroy: () => {
          // Clean up event listeners
          resizeHandles.querySelectorAll(".resize-handle").forEach((handle) => {
            handle.removeEventListener("mousedown", startResize);
          });

          document.removeEventListener("mousemove", resize);
          document.removeEventListener("mouseup", stopResize);

          toolbar.querySelectorAll("button").forEach((button) => {
            button.removeEventListener("click", () => {});
          });
        },
      };
    };
  },
});

// Custom extension for inline styling
const InlineStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) {
            return {};
          }
          return {
            style: `font-size: ${attributes.fontSize}`,
          };
        },
      },
      fontWeight: {
        default: null,
        parseHTML: (element) => element.style.fontWeight,
        renderHTML: (attributes) => {
          if (!attributes.fontWeight) {
            return {};
          }
          return {
            style: `font-weight: ${attributes.fontWeight}`,
          };
        },
      },
      headingLevel: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-heading-level"),
        renderHTML: (attributes) => {
          if (!attributes.headingLevel) {
            return {};
          }
          return {
            "data-heading-level": attributes.headingLevel,
          };
        },
      },
    };
  },
});

const headingStyles = [
  {
    level: 1,
    fontSize: "2em",
    fontWeight: "normal", // Changed from "bold" to "normal"
    label: "Heading 1",
    icon: <LuHeading1 className="h-4 w-4 mr-2" />,
  },
  {
    level: 2,
    fontSize: "1.5em",
    fontWeight: "normal", // Changed from "bold" to "normal"
    label: "Heading 2",
    icon: <LuHeading2 className="h-4 w-4 mr-2" />,
  },
  {
    level: 3,
    fontSize: "1.25em",
    fontWeight: "normal", // Changed from "bold" to "normal"
    label: "Heading 3",
    icon: <LuHeading3 className="h-4 w-4 mr-2" />,
  },
  {
    level: 4,
    fontSize: "1.1em",
    fontWeight: "normal", // Changed from "bold" to "normal"
    label: "Heading 4",
    icon: <span className="font-semibold text-xs mr-2">H4</span>,
  },
  {
    level: 5,
    fontSize: "0.9em",
    fontWeight: "normal", // Changed from "bold" to "normal"
    label: "Heading 5",
    icon: <span className="font-semibold text-xs mr-2">H5</span>,
  },
  {
    level: 6,
    fontSize: "0.8em",
    fontWeight: "normal", // Changed from "bold" to "normal"
    label: "Heading 6",
    icon: <span className="font-semibold text-xs mr-2">H6</span>,
  },
];

const TextEditor = forwardRef(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      disabled = false,
      placeholder = "Start writing...",
      value = "",
      defaultValue = "",
      onValueChange,
      onChange,
      maxLength,
      minHeight = "200px",
      maxHeight = "500px",
      imageUploadHandler,
      ...props
    },
    ref
  ) => {
    const [content, setContent] = useState(value || defaultValue || "");
    const [linkUrl, setLinkUrl] = useState("");
    const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const [selectedText, setSelectedText] = useState("");
    const [isHeadingMenuOpen, setIsHeadingMenuOpen] = useState(false);
    const [isFontSizeMenuOpen, setIsFontSizeMenuOpen] = useState(false);
    const [activeHeadingLevel, setActiveHeadingLevel] = useState(null);
    const [activeFontSize, setActiveFontSize] = useState("16px");
    const fileInputRef = useRef(null);
    const linkInputRef = useRef(null);
    const colorMenuRef = useRef(null);
    const headingMenuRef = useRef(null);
    const fontSizeMenuRef = useRef(null);

    // Define common colors for the color picker with better organization
    const colorGroups = [
      {
        name: "Basic",
        colors: [
          { value: "#000000", name: "Black" },
          { value: "#5C5C5C", name: "Dark Gray" },
          { value: "#8E8E8E", name: "Gray" },
          { value: "#C3C3C3", name: "Light Gray" },
          { value: "#FFFFFF", name: "White" },
        ],
      },
      {
        name: "Primary",
        colors: [
          { value: "#FF0000", name: "Red" },
          { value: "#FF8000", name: "Orange" },
          { value: "#FFFF00", name: "Yellow" },
          { value: "#00FF00", name: "Green" },
          { value: "#00FFFF", name: "Cyan" },
          { value: "#0000FF", name: "Blue" },
          { value: "#8000FF", name: "Purple" },
          { value: "#FF00FF", name: "Magenta" },
        ],
      },
      {
        name: "Pastel",
        colors: [
          { value: "#FFB6C1", name: "Light Pink" },
          { value: "#FFD700", name: "Gold" },
          { value: "#98FB98", name: "Pale Green" },
          { value: "#ADD8E6", name: "Light Blue" },
          { value: "#DDA0DD", name: "Plum" },
          { value: "#F0E68C", name: "Khaki" },
        ],
      },
    ];

    // Define font sizes
    const fontSizes = [
      { value: "8px", label: "8px" },
      { value: "10px", label: "10px" },
      { value: "12px", label: "12px" },
      { value: "14px", label: "14px" },
      { value: "16px", label: "16px" },
      { value: "18px", label: "18px" },
      { value: "20px", label: "20px" },
      { value: "24px", label: "24px" },
      { value: "30px", label: "30px" },
      { value: "36px", label: "36px" },
      { value: "48px", label: "48px" },
      { value: "60px", label: "60px" },
      { value: "72px", label: "72px" },
    ];

    // Define heading styles

    // Initialize the editor
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: false, // Disable native heading to use our custom inline styling
        }),
        Underline,
        Link.configure({
          openOnClick: true,
          linkOnPaste: true,
        }),
        ResizableImage.configure({
          allowBase64: true,
          inline: true,
        }),
        TextAlign.configure({
          types: ["paragraph"],
          alignments: ["left", "center", "right", "justify"],
        }),
        Placeholder.configure({
          placeholder,
        }),
        InlineStyle,
        Color,
        Highlight.configure({
          multicolor: true,
        }),
      ],
      content,
      editable: !disabled,
      onSelectionUpdate: ({ editor }) => {
        // Update active heading level and font size when selection changes
        if (editor) {
          const attrs = editor.getAttributes("textStyle");

          // Check for heading level
          if (attrs.headingLevel) {
            setActiveHeadingLevel(Number.parseInt(attrs.headingLevel));
          } else {
            setActiveHeadingLevel(null);
          }

          // Check for font size
          if (attrs.fontSize) {
            setActiveFontSize(attrs.fontSize);
          } else {
            setActiveFontSize("16px");
          }
        }
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        setContent(html);

        // Call both callbacks if provided
        if (onChange) {
          const syntheticEvent = {
            target: { value: html },
          };
          onChange(syntheticEvent);
        }

        if (onValueChange) {
          onValueChange(html);
        }
      },
    });

    // Update editor content when value prop changes
    useEffect(() => {
      if (editor && value !== undefined && value !== content) {
        editor.commands.setContent(value);
        setContent(value);
      }
    }, [value, editor]);

    // Focus the link input when the link menu opens
    useEffect(() => {
      if (isLinkMenuOpen && linkInputRef.current) {
        setTimeout(() => {
          linkInputRef.current.focus();
        }, 100);
      }
    }, [isLinkMenuOpen]);

    // Handle click outside for dropdowns
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          colorMenuRef.current &&
          !colorMenuRef.current.contains(event.target)
        ) {
          setIsColorMenuOpen(false);
        }
        if (
          headingMenuRef.current &&
          !headingMenuRef.current.contains(event.target)
        ) {
          setIsHeadingMenuOpen(false);
        }
        if (
          fontSizeMenuRef.current &&
          !fontSizeMenuRef.current.contains(event.target)
        ) {
          setIsFontSizeMenuOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    // Updated handleImageUpload function to set left alignment by default
    const handleImageUpload = async (e) => {
      const files = e.target.files;

      if (files && files.length > 0) {
        const file = files[0];

        // If a custom image upload handler is provided, use it
        if (imageUploadHandler) {
          try {
            const url = await imageUploadHandler(file);
            // Insert image with default width and left alignment
            editor
              .chain()
              .focus()
              .setImage({
                src: url,
                alignment: "left", // Changed from center to left
              })
              .run();
          } catch (error) {
            console.error("Error uploading image:", error);
          }
        } else {
          // Otherwise, use a base64 encoded image
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result) {
              // Insert image with default width and left alignment
              editor
                .chain()
                .focus()
                .setImage({
                  src: reader.result,
                  alignment: "left", // Changed from center to left
                })
                .run();
            }
          };
          reader.readAsDataURL(file);
        }
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    // Handle link insertion
    const handleLinkInsert = () => {
      if (linkUrl) {
        // Check if the URL has a protocol, if not add https://
        const url = linkUrl.match(/^https?:\/\//)
          ? linkUrl
          : `https://${linkUrl}`;

        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();

        setLinkUrl("");
        setIsLinkMenuOpen(false);
      }
    };

    // Handle link removal
    const handleLinkRemove = () => {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkUrl("");
      setIsLinkMenuOpen(false);
    };

    // Open link menu and capture selected text
    const openLinkMenu = () => {
      if (editor) {
        const { from, to } = editor.state.selection;
        const text = editor.state.doc.textBetween(from, to);
        setSelectedText(text);

        // If there's a link at the current position, get its URL
        const linkMark = editor.getAttributes("link");
        if (linkMark.href) {
          setLinkUrl(linkMark.href);
        } else {
          setLinkUrl("");
        }

        setIsLinkMenuOpen(true);
      }
    };

    // Apply text color with focus preservation
    const applyColor = (color) => {
      // First ensure we have focus and selection is preserved
      editor.chain().focus().run();
      // Then apply the color
      editor.chain().setColor(color).run();
      setIsColorMenuOpen(false);
    };

    // Apply highlight color with focus preservation
    const applyHighlight = (color) => {
      // First ensure we have focus and selection is preserved
      editor.chain().focus().run();
      // Then apply the highlight
      editor.chain().toggleHighlight({ color }).run();
      setIsColorMenuOpen(false);
    };

    // Apply heading style to selected text only using inline styling
    const applyHeadingStyle = (style) => {
      if (!editor) return;

      editor.chain().focus().run();

      // Get current attributes to preserve font weight if it exists
      const currentAttrs = editor.getAttributes("textStyle");
      const currentFontWeight = currentAttrs.fontWeight || "normal";

      // Apply heading-like styling to selected text only, preserving font weight
      editor
        .chain()
        .focus()
        .setMark("textStyle", {
          fontSize: style.fontSize,
          fontWeight: currentFontWeight, // Preserve existing font weight
          headingLevel: style.level.toString(),
        })
        .run();

      // Update active heading level
      setActiveHeadingLevel(style.level);
      setIsHeadingMenuOpen(false);
    };

    // Clear heading style
    const clearHeadingStyle = () => {
      if (!editor) return;

      editor.chain().focus().run();

      // Remove heading-like styling
      editor.chain().focus().unsetMark("textStyle").run();

      // Reset active heading level
      setActiveHeadingLevel(null);
      setIsHeadingMenuOpen(false);
    };

    // Apply font size to selected text
    const applyFontSize = (size) => {
      if (!editor) return;

      editor.chain().focus().run();

      // Apply font size to selected text
      editor.chain().focus().setMark("textStyle", { fontSize: size }).run();

      // Update active font size
      setActiveFontSize(size);
      setIsFontSizeMenuOpen(false);
    };

    // Get current heading level based on text style
    const getCurrentHeadingLevel = () => {
      if (!editor) return "Paragraph";

      if (activeHeadingLevel === 1) return "H1";
      if (activeHeadingLevel === 2) return "H2";
      if (activeHeadingLevel === 3) return "H3";
      if (activeHeadingLevel === 4) return "H4";
      if (activeHeadingLevel === 5) return "H5";
      if (activeHeadingLevel === 6) return "H6";

      return "Paragraph";
    };

    if (!editor) {
      return null;
    }

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth && "w-full",
          className
        )}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700">{label}</label>
        )}

        <div
          className={cn(
            "border rounded-md overflow-hidden bg-white",
            error && "border-red-500",
            disabled && "opacity-60 cursor-not-allowed"
          )}
        >
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-0.5 p-1 border-b bg-gray-50">
            {/* Paragraph button and Heading dropdown */}
            <div className="flex items-center border-r pr-1 mr-1">
              <button
                type="button"
                onClick={() => clearHeadingStyle()}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  !activeHeadingLevel && "bg-gray-200"
                )}
                title="Paragraph"
                disabled={disabled}
              >
                <LuText className="h-4 w-4" />
              </button>

              <div className="relative ml-1" ref={headingMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsHeadingMenuOpen(!isHeadingMenuOpen)}
                  className={cn(
                    "p-1.5 rounded hover:bg-gray-200 flex items-center",
                    isHeadingMenuOpen && "bg-gray-200"
                  )}
                  title="Headings"
                  disabled={disabled}
                >
                  <LuHeading1 className="h-4 w-4 mr-1" />
                  <span className="text-sm">{getCurrentHeadingLevel()}</span>
                  <LuChevronDown className="h-4 w-4 ml-1" />
                </button>
                {isHeadingMenuOpen && (
                  <div
                    className="absolute z-50 mt-1 p-1 bg-white rounded-md shadow-lg border border-gray-200 min-w-32"
                    style={{ top: "38px", left: "0" }}
                  >
                    <button
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded text-sm hover:bg-gray-100 flex items-center",
                        !activeHeadingLevel && "bg-gray-100"
                      )}
                      onClick={() => clearHeadingStyle()}
                    >
                      <LuText className="h-4 w-4 mr-2" />
                      Paragraph
                    </button>

                    {headingStyles.map((style) => (
                      <button
                        key={style.level}
                        className={cn(
                          "w-full text-left px-3 py-1.5 rounded text-sm hover:bg-gray-100 flex items-center",
                          activeHeadingLevel === style.level && "bg-gray-100"
                        )}
                        onClick={() => applyHeadingStyle(style)}
                      >
                        {style.icon}
                        {style.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Font size dropdown */}
            <div
              className="relative flex items-center border-r pr-1 mr-1"
              ref={fontSizeMenuRef}
            >
              <button
                type="button"
                onClick={() => setIsFontSizeMenuOpen(!isFontSizeMenuOpen)}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200 flex items-center min-w-20 justify-between",
                  isFontSizeMenuOpen && "bg-gray-200"
                )}
                title="Font size"
                disabled={disabled}
              >
                <LuType className="h-4 w-4 mr-1" />
                <span className="text-sm">{activeFontSize}</span>
                <LuChevronDown className="h-4 w-4 ml-1" />
              </button>
              {isFontSizeMenuOpen && (
                <div
                  className="absolute z-50 mt-1 p-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto"
                  style={{ top: "100%", left: "0", width: "120px" }}
                >
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded text-sm hover:bg-gray-100",
                        activeFontSize === size.value && "bg-gray-100"
                      )}
                      onClick={() => applyFontSize(size.value)}
                    >
                      <span style={{ fontSize: size.value }}>{size.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Image upload */}
            <div className="flex items-center border-r pr-1 mr-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded hover:bg-gray-200 flex items-center"
                title="Insert Image"
                disabled={disabled}
              >
                <LuImage className="h-4 w-4 mr-1" />
                <span className="text-sm">Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={disabled}
              />
            </div>

            {/* Text formatting */}
            <div className="flex items-center border-r pr-1 mr-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive("bold") && "bg-gray-200"
                )}
                title="Bold"
                disabled={disabled}
              >
                <LuBold className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive("italic") && "bg-gray-200"
                )}
                title="Italic"
                disabled={disabled}
              >
                <LuItalic className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive("underline") && "bg-gray-200"
                )}
                title="Underline"
                disabled={disabled}
              >
                <LuUnderline className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive("strike") && "bg-gray-200"
                )}
                title="Strikethrough"
                disabled={disabled}
              >
                <LuStrikethrough className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive("code") && "bg-gray-200"
                )}
                title="Code"
                disabled={disabled}
              >
                <LuCode className="h-4 w-4" />
              </button>
            </div>

            {/* Lists */}
            <div className="flex items-center border-r pr-1 mr-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive("bulletList") && "bg-gray-200"
                )}
                title="Bullet List"
                disabled={disabled}
              >
                <LuList className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive("orderedList") && "bg-gray-200"
                )}
                title="Ordered List"
                disabled={disabled}
              >
                <LuListOrdered className="h-4 w-4" />
              </button>
            </div>

            {/* Alignment */}
            <div className="flex items-center border-r pr-1 mr-1">
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().setTextAlign("left").run();
                  // Ensure editor keeps focus after alignment
                  editor.commands.focus();
                }}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive({ textAlign: "left" }) && "bg-gray-200"
                )}
                title="Align Left"
                disabled={disabled}
              >
                <LuAlignLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().setTextAlign("center").run();
                  // Ensure editor keeps focus after alignment
                  editor.commands.focus();
                }}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive({ textAlign: "center" }) && "bg-gray-200"
                )}
                title="Align Center"
                disabled={disabled}
              >
                <LuAlignCenter className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().setTextAlign("right").run();
                  // Ensure editor keeps focus after alignment
                  editor.commands.focus();
                }}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive({ textAlign: "right" }) && "bg-gray-200"
                )}
                title="Align Right"
                disabled={disabled}
              >
                <LuAlignRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().setTextAlign("justify").run();
                  // Ensure editor keeps focus after alignment
                  editor.commands.focus();
                }}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive({ textAlign: "justify" }) && "bg-gray-200"
                )}
                title="Justify"
                disabled={disabled}
              >
                <LuAlignJustify className="h-4 w-4" />
              </button>
            </div>

            {/* Special elements */}
            <div className="flex items-center border-r pr-1 mr-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={cn(
                  "p-1.5 rounded hover:bg-gray-200",
                  editor.isActive("blockquote") && "bg-gray-200"
                )}
                title="Quote"
                disabled={disabled}
              >
                <LuQuote className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="p-1.5 rounded hover:bg-gray-200"
                title="Horizontal Rule"
                disabled={disabled}
              >
                <LuSeparatorHorizontal className="h-4 w-4" />
              </button>
              {/* Color menu */}
              <div className="relative" ref={colorMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                  className={cn(
                    "p-1.5 rounded hover:bg-gray-200 flex items-center",
                    isColorMenuOpen && "bg-gray-200"
                  )}
                  title="Text Color"
                  disabled={disabled}
                >
                  <LuPalette className="h-4 w-4 mr-1" />
                  <span className="text-sm">Colors</span>
                </button>
                {isColorMenuOpen && (
                  <div className="absolute z-50 top-full right-0 mt-1 p-2 bg-white rounded-md shadow-lg border border-gray-200 w-72">
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-medium text-gray-600">
                          Text Color
                        </p>
                        <button
                          className="text-xs text-blue-500 hover:text-blue-700"
                          onClick={() =>
                            editor.chain().focus().unsetColor().run()
                          }
                        >
                          Reset
                        </button>
                      </div>
                      <div className="grid grid-cols-10 gap-1">
                        {colorGroups
                          .flatMap((group) => group.colors)
                          .map((color) => (
                            <button
                              key={`text-${color.value}`}
                              type="button"
                              onClick={() => applyColor(color.value)}
                              className={cn(
                                "w-6 h-6 rounded flex items-center justify-center",
                                editor.isActive("textStyle", {
                                  color: color.value,
                                })
                                  ? "ring-2 ring-offset-1 ring-blue-500"
                                  : "border border-gray-300"
                              )}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            >
                              {editor.isActive("textStyle", {
                                color: color.value,
                              }) && (
                                <LuCheck className="h-3 w-3 text-white mix-blend-difference" />
                              )}
                            </button>
                          ))}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs font-medium text-gray-600">
                          Highlight
                        </p>
                        <button
                          className="text-xs text-blue-500 hover:text-blue-700"
                          onClick={() =>
                            editor.chain().focus().unsetHighlight().run()
                          }
                        >
                          Reset
                        </button>
                      </div>
                      <div className="grid grid-cols-10 gap-1">
                        {colorGroups
                          .flatMap((group) => group.colors)
                          .slice(0, 10)
                          .map((color) => (
                            <button
                              key={`highlight-${color.value}`}
                              type="button"
                              onClick={() => applyHighlight(color.value)}
                              className={cn(
                                "w-6 h-6 rounded flex items-center justify-center",
                                editor.isActive("highlight", {
                                  color: color.value,
                                })
                                  ? "ring-2 ring-offset-1 ring-blue-500"
                                  : "border border-gray-300"
                              )}
                              style={{ backgroundColor: color.value }}
                              title={`Highlight ${color.name}`}
                            >
                              <LuHighlighter className="h-3 w-3 text-white mix-blend-difference" />
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center border-r pr-1 mr-1">
              <div className="relative">
                <button
                  type="button"
                  onClick={openLinkMenu}
                  className={cn(
                    "p-1.5 rounded hover:bg-gray-200 flex items-center",
                    (editor.isActive("link") || isLinkMenuOpen) && "bg-gray-200"
                  )}
                  title="Link"
                  disabled={disabled}
                >
                  <LuLink className="h-4 w-4 mr-1" />
                  <span className="text-sm">Link</span>
                </button>
                {isLinkMenuOpen && (
                  <div className="absolute z-50 top-full right-0 mt-1 p-3 bg-white rounded-md shadow-lg border border-gray-200 w-72">
                    <div className="flex flex-col gap-2">
                      {selectedText && (
                        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                          Selected text:{" "}
                          <span className="font-medium">{selectedText}</span>
                        </div>
                      )}
                      <label className="text-xs font-medium text-gray-600">
                        URL
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          ref={linkInputRef}
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="flex-1 px-2 py-1.5 text-sm border rounded-l focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleLinkInsert();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleLinkInsert}
                          disabled={!linkUrl}
                          className="px-2 py-1 bg-blue-500 text-white rounded-r hover:bg-blue-600 disabled:opacity-50"
                        >
                          <LuCheck className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex justify-between mt-2">
                        {editor.isActive("link") ? (
                          <button
                            type="button"
                            onClick={handleLinkRemove}
                            className="px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center"
                          >
                            <LuX className="h-3 w-3 mr-1" />
                            Remove Link
                          </button>
                        ) : (
                          <div></div>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsLinkMenuOpen(false)}
                          className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Undo/Redo */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                className="p-1.5 rounded hover:bg-gray-200"
                title="Undo"
                disabled={disabled || !editor.can().undo()}
              >
                <LuUndo className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                className="p-1.5 rounded hover:bg-gray-200"
                title="Redo"
                disabled={disabled || !editor.can().redo()}
              >
                <LuRedo className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Editor content */}
          <div
            className="prose prose-sm max-w-none"
            style={{ minHeight, maxHeight, overflow: "auto" }}
          >
            <EditorContent
              editor={editor}
              className="p-3 focus:outline-none"
              ref={ref}
              {...props}
            />
          </div>
        </div>

        {/* Character count */}
        {maxLength && (
          <div className="flex justify-end">
            <span className="text-xs text-gray-500">
              {editor.storage.characterCount.characters()}/{maxLength}
            </span>
          </div>
        )}

        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);

TextEditor.displayName = "TextEditor";

export { TextEditor };
