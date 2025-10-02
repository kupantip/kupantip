"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { createPost } from "../../../services/user/create-post_page";

export default function CreatePostPage() {
  const [tab, setTab] = useState<"text" | "media">("text");
  const [formData, setFormData] = useState({
    title: "",
    body_md: "",
    url: "",
    category_id: "",
    files: [] as File[]
  });

  const router = useRouter()

  const onDrop = (acceptedFiles: File[]) => {
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...acceptedFiles],
    }));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "video/*": [],
    },
  });

  const createSlug = (title : string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const slug = createSlug(formData.title);
    const uniqueId = uuidv4()
    const postUrl = `http://posts/${slug}/${uniqueId}`;

    try {
      const res = await createPost({ ...formData, url: postUrl});
      router.push("/dashboard")
    } catch (err: any) {
      console.log("Error: " + err.message);
    }
  };

  return (
    <div className="flex flex-col w-200 ml-60 mt-5">
      <h1 className="text-3xl font-bold mb-4">Create Post</h1>
      <div className="flex gap-4 mb-4 bg-white">
        <button
          type="button"
          onClick={() => setTab("text")}
          className={`py-2 px-4 transition-colors duration-200 hover:bg-gray-100 cursor-pointer ${
            tab === "text"
              ? "border-b-4 border-blue-500 font-semibold"
              : "font-semibold"
          }`}
        >
          Text
        </button>

        <button
          type="button"
          onClick={() => setTab("media")}
          className={`py-2 px-4 transition-colors duration-200 hover:bg-gray-100 cursor-pointer ${
            tab === "media"
              ? "border-b-4 border-blue-500 font-semibold"
              : "font-semibold"
          }`}
        >
          Images & Video
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="border rounded-xl p-3"
          required
        />

        <select
          className="border rounded-xl p-3"
          value={formData.category_id}
          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
        >
          <option value="">Select Category</option>
        </select>

        {tab === "text" && (
          <textarea
            placeholder="Body text (optional)"
            className="border p-3 rounded-xl h-40"
            value={formData.body_md}
            onChange={(e) => setFormData({ ...formData, body_md: e.target.value })}
          />
        )}

        {tab === "media" && (
          <div className="flex flex-col gap-4">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer min-h-[200px] flex items-center justify-center ${
                isDragActive ? "bg-blue-50 border-blue-400" : "border-gray-300"
              }`}
            >
              <input {...getInputProps()} />
              {formData.files.length === 0 ? (
                <p>
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag & drop images/videos here, or click to select"}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-4 w-full">
                  {formData.files.map((file, i) => (
                    <div key={i} className="relative group">
                      {file.type.startsWith("image/") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="h-32 w-full object-cover rounded"
                        />
                      ) : (
                        <video
                          controls
                          className="h-32 w-full object-cover rounded"
                          src={URL.createObjectURL(file)}
                        />
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({
                            ...prev,
                            files: prev.files.filter((_, idx) => idx !== i),
                          }));
                        }}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full pl-2 pr-2 pt-1 pb-1 text-xs opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <textarea
              placeholder="Body text"
              className="border p-3 rounded-xl h-40"
              value={formData.body_md}
              onChange={(e) => setFormData({ ...formData, body_md: e.target.value })}
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            className="bg-emerald-800 rounded-full hover:bg-emerald-900 cursor-pointer"
          >
            Post
          </Button>
        </div>
      </form>
    </div>
  );
}

