"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Input } from "../ui/input/Input";
import { Select } from "../ui/select/Select";
import { Textarea } from "../ui/textarea/Textarea";
import { continents } from "@/utils/FakeData";
import Image from "next/image";

export default function BlogForm({
  onSubmit,
  submitText,
  onCancel,
  formData,
  setFormData,
}) {
  const [previewBase64, setPreviewBase64] = useState("");
  const fileInputRef = useRef(null);
  const isLoading = false;

  useEffect(() => {
    if (formData?.thumbnail && typeof formData.thumbnail === "object") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewBase64(reader.result);
      };
      reader.readAsDataURL(formData.thumbnail);
    } else {
      setPreviewBase64("");
    }
  }, [formData.thumbnail]);

  const handleRemoveThumbnail = () => {
    setFormData({ ...formData, thumbnail: "" });
    setPreviewBase64("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          label="Title"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter blog title"
          required
          requiredSign={true}
        />
      </div>

      <div>
        <Textarea
          label="Content"
          id="content"
          value={formData.content}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder="Enter blog content"
          rows={4}
          required
          requiredSign={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Continent"
            options={continents}
            value={formData.continent}
            onChange={(e) =>
              setFormData({ ...formData, continent: e.target.value })
            }
            fullWidth
            className="h-10 dark:border-[#475569]"
          />
        </div>
        <div>
          <Input
            label="Country"
            id="country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            placeholder="Enter country"
            required
            requiredSign={true}
          />
        </div>
      </div>

      <div className="flex gap-3 items-end">
        <Input
          type="file"
          label="Thumbnail Image"
          id="thumbnail"
          inputRef={fileInputRef}
          onChange={(e) =>
            setFormData({ ...formData, thumbnail: e.target.files[0] })
          }
          required
          requiredSign={true}
          fullWidth
          placeholder="Upload your image here"
        />

        {previewBase64 && (
          <div className=" relative w-fit">
            <Image
              width={1000}
              height={1000}
              src={previewBase64}
              alt="Thumbnail Preview"
              className="w-48 h-14 object-cover rounded-md border"
            />
            <button
              type="button"
              onClick={handleRemoveThumbnail}
              className="absolute top-1 right-1 text-xs bg-red-500 text-white rounded p-1 hover:bg-red-600"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </div>

      <div>
        <Input
          label="Video URL"
          id="videoUrl"
          value={formData.videoUrl}
          onChange={(e) =>
            setFormData({ ...formData, videoUrl: e.target.value })
          }
          placeholder="Enter video URL (You tube link)"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-red-100 hover:border-red-100 hover:text-red-500 focus:outline-none  dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={
            !formData.title ||
            !formData.content ||
            !formData.thumbnail ||
            !formData.continent ||
            !formData.country
          }
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md shadow-sm hover:bg-[#3da280] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            submitText
          )}
        </button>
      </div>
    </div>
  );
}
