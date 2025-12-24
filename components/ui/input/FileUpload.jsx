"use client";

import { useState, useRef, useEffect, forwardRef } from "react";
import { cn } from "@/lib/utils";
import {
  LuUpload,
  LuFile,
  LuImage,
  LuFileText,
  LuFilm,
  LuMusic,
  LuFileCode,
  LuPackage,
  LuTrash,
  LuDownload,
  LuEye,
  LuPlus,
  LuBadgeAlert,
} from "react-icons/lu";

const FileUpload = forwardRef(
  (
    {
      className,
      label,
      helperText,
      error,
      fullWidth = false,
      disabled = false,
      multiple = false,
      accept,
      maxSize = 5 * 1024 * 1024, // 5MB default
      maxFiles = 5,
      value = [],
      defaultValue = [],
      onValueChange,
      onChange,
      showPreview = true,
      previewMaxHeight = 200,
      allowDownload = true,
      ...props
    },
    ref,
  ) => {
    const [files, setFiles] = useState(
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [],
    );
    const [isDragging, setIsDragging] = useState(false);
    const [uploadErrors, setUploadErrors] = useState([]);
    const fileInputRef = useRef(null);

    useEffect(() => {
      if (
        value !== undefined &&
        JSON.stringify(value) !== JSON.stringify(files)
      ) {
        setFiles(Array.isArray(value) ? value : []);
      }
    }, [value]);

    const handleFileChange = (e) => {
      e.preventDefault();
      const selectedFiles = e.target.files || e.dataTransfer.files;
      processFiles(selectedFiles);
    };

    const processFiles = (selectedFiles) => {
      const newErrors = [];
      const newFiles = [...files];
      const filesArray = Array.from(selectedFiles);

      // Check if adding these files would exceed maxFiles
      if (!multiple && filesArray.length > 0) {
        // For single file upload, replace the existing file
        newFiles.splice(0, newFiles.length);
      } else if (newFiles.length + filesArray.length > maxFiles) {
        newErrors.push(`You can only upload a maximum of ${maxFiles} files.`);
        return;
      }

      filesArray.forEach((file) => {
        // Check file size
        if (file.size > maxSize) {
          newErrors.push(
            `"${file.name}" exceeds the maximum file size of ${formatBytes(maxSize)}.`,
          );
          return;
        }

        // Check file type if accept is specified
        if (accept && !isFileTypeAccepted(file, accept)) {
          newErrors.push(`"${file.name}" is not an accepted file type.`);
          return;
        }

        // Create a URL for the file for preview
        const fileWithPreview = {
          file,
          id: generateUniqueId(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadProgress: 100,
          uploaded: true,
          error: null,
        };

        newFiles.push(fileWithPreview);
      });

      setUploadErrors(newErrors);
      setFiles(newFiles);

      // Call both callbacks if provided
      if (onChange) {
        const syntheticEvent = {
          target: { value: newFiles },
        };
        onChange(syntheticEvent);
      }

      if (onValueChange) {
        onValueChange(newFiles);
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };

    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (!disabled) {
        handleFileChange(e);
      }
    };

    const handleRemoveFile = (id) => {
      const newFiles = files.filter((file) => file.id !== id);
      setFiles(newFiles);

      // Call both callbacks if provided
      if (onChange) {
        const syntheticEvent = {
          target: { value: newFiles },
        };
        onChange(syntheticEvent);
      }

      if (onValueChange) {
        onValueChange(newFiles);
      }
    };

    const handlePreviewFile = (file) => {
      if (file.url) {
        window.open(file.url, "_blank");
      }
    };

    const handleDownloadFile = (file) => {
      if (file.url) {
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    };

    const isFileTypeAccepted = (file, acceptString) => {
      const acceptedTypes = acceptString.split(",").map((type) => type.trim());
      const fileType = file.type;

      return acceptedTypes.some((type) => {
        // Handle wildcards like image/*
        if (type.endsWith("/*")) {
          const category = type.split("/")[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      });
    };

    const generateUniqueId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    };

    const formatBytes = (bytes, decimals = 2) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (
        Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
      );
    };

    const getFileIcon = (fileType) => {
      if (fileType.startsWith("image/")) return <LuImage className="h-5 w-5" />;
      if (fileType.startsWith("video/")) return <LuFilm className="h-5 w-5" />;
      if (fileType.startsWith("audio/")) return <LuMusic className="h-5 w-5" />;
      if (fileType === "application/pdf")
        return <LuFileText className="h-5 w-5" />;
      if (
        fileType.includes("word") ||
        fileType === "application/rtf" ||
        fileType === "text/plain"
      )
        return <LuFileText className="h-5 w-5" />;
      if (fileType.includes("excel") || fileType.includes("spreadsheet"))
        return <LuFileText className="h-5 w-5" />;
      if (
        fileType.includes("javascript") ||
        fileType.includes("json") ||
        fileType.includes("html")
      )
        return <LuFileCode className="h-5 w-5" />;
      if (fileType.includes("zip") || fileType.includes("compressed"))
        return <LuPackage className="h-5 w-5" />;
      return <LuFile className="h-5 w-5" />;
    };

    const canPreview = (fileType) => {
      return fileType.startsWith("image/") || fileType === "application/pdf";
    };

    return (
      <div
        className={cn(
          "flex flex-col gap-1.5",
          fullWidth && "w-full",
          className,
        )}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700 ">{label}</label>
        )}

        {files.length === 0 ? (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-gray-200 dark:border-gray-700",
              disabled && "opacity-50 cursor-not-allowed",
              error && "border-red-500",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => {
              if (!disabled) {
                fileInputRef.current?.click();
              }
            }}
          >
            <div className="flex flex-col items-center justify-center py-4">
              <LuUpload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Drag & drop {multiple ? "files" : "a file"} here, or{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) {
                      fileInputRef.current?.click();
                    }
                  }}
                  disabled={disabled}
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">
                {accept
                  ? `Accepted file types: ${accept.split(",").join(", ")}`
                  : "All file types accepted"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 text-center">
                Maximum file size: {formatBytes(maxSize)}
                {multiple && `, up to ${maxFiles} files`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex flex-col border rounded-md overflow-hidden bg-gray-50 border-gray-200"
              >
                {showPreview && file.type.startsWith("image/") && (
                  <div className="relative w-full flex justify-center bg-gray-100 border-b border-gray-200">
                    <img
                      src={file.url || "/placeholder.svg"}
                      alt={file.name}
                      className="object-contain"
                      style={{ maxHeight: `${previewMaxHeight}px` }}
                    />
                  </div>
                )}

                <div className="p-3 flex items-center">
                  <div className="mr-3 text-gray-500">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(file.size)}
                    </p>

                    {file.uploadProgress < 100 && !file.error && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${file.uploadProgress}%` }}
                        ></div>
                      </div>
                    )}

                    {file.error && (
                      <p className="text-xs text-red-500 mt-1 flex items-center">
                        <LuAlertCircle className="h-3 w-3 mr-1" />
                        {file.error}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-2">
                    {file.uploaded && canPreview(file.type) && (
                      <button
                        type="button"
                        onClick={() => handlePreviewFile(file)}
                        className="p-2 cursor-pointer rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        title="Preview"
                      >
                        <LuEye className="h-4 w-4" />
                      </button>
                    )}

                    {file.uploaded && allowDownload && (
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 cursor-pointer rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        title="Download"
                      >
                        <LuDownload className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-2 cursor-pointer rounded-md text-gray-500 hover:text-red-500 hover:bg-gray-100"
                      title="Remove"
                    >
                      <LuTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {multiple && files.length < maxFiles && (
              <button
                type="button"
                className="flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:text-primary hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
              >
                <LuPlus className="h-5 w-5 mr-2" />
                <span>Add more files</span>
              </button>
            )}
          </div>
        )}

        <input
          ref={(node) => {
            fileInputRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          {...props}
        />

        {uploadErrors.length > 0 && (
          <div className="mt-2">
            {uploadErrors.map((err, index) => (
              <p key={index} className="text-xs text-red-500 flex items-center">
                <LuBadgeAlert className="h-3 w-3 mr-1" />
                {err}
              </p>
            ))}
          </div>
        )}

        {helperText && !error && (
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
        )}

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  },
);

FileUpload.displayName = "FileUpload";

export { FileUpload };
