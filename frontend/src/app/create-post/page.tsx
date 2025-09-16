"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CreatePost() {
  const [tab, setTab] = useState<"text" | "media" | "link">("text");
  const [data, setData] = useState({
    title: "",
    body_md: "",
    url: "",
    category_id: "",
    files: [] as File[],
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  const onDrop = (acceptedFiles: File[]) => {
    setData((prev) => ({
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

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white rounded-md shadow">
      <h1 className="text-2xl font-bold mb-4">Create Post</h1>

      <div className="flex gap-4 border-b mb-4 bg-white">
        <button
          onClick={() => setTab("text")}
          className={`py-2 px-4 transition-colors duration-200 ${
            tab === "text"
              ? "border-b-4 border-blue-500 font-semibold"
              : "font-semibold hover:bg-gray-100"
          }`}
        >
          Text
        </button>

        <button
          onClick={() => setTab("media")}
          className={`py-2 px-4 transition-colors duration-200 ${
            tab === "media"
              ? "border-b-4 border-blue-500 font-semibold"
              : "font-semibold hover:bg-gray-100"
          }`}
        >
          Images & Video
        </button>

        <button
          onClick={() => setTab("link")}
          className={`py-2 px-4 transition-colors duration-200 ${
            tab === "link"
              ? "border-b-4 border-blue-500 font-semibold"
              : "font-semibold hover:bg-gray-100"
          }`}
        >
          Link
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Title"
          className="border rounded-xl p-3"
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          required
        />

        <select
          className="border rounded-xl p-3"
          value={data.category_id}
          onChange={(e) => setData({ ...data, category_id: e.target.value })}
        >
          <option value="">Select Category</option>
          <option value="64D7423E-F36B-1410-84C9-00F2EA0D0522">Anime</option>
        </select>

        {tab === "text" && (
          <textarea
            placeholder="Body text (optional)"
            className="border p-3 rounded-xl h-40"
            value={data.body_md}
            onChange={(e) => setData({ ...data, body_md: e.target.value })}
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
              {data.files.length === 0 ? (
                <p>
                  {isDragActive
                    ? "Drop files here..."
                    : "Drag & drop images/videos here, or click to select"}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-4 w-full">
                  {data.files.map((file, i) => (
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
                          setData((prev) => ({
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
              placeholder="Body text (optional)"
              className="border p-3 rounded-xl h-40"
              value={data.body_md}
              onChange={(e) => setData({ ...data, body_md: e.target.value })}
            />
          </div>
        )}

        {/* Link Tab */}
        {tab === "link" && (
          <div className="flex flex-col gap-4">
            <input
              type="url"
              placeholder="Link URL"
              className="border p-3 rounded-xl"
              value={data.url}
              onChange={(e) => setData({ ...data, url: e.target.value })}
            />
            <textarea
              placeholder="Body text (optional)"
              className="border p-3 rounded-xl h-40"
              value={data.body_md}
              onChange={(e) => setData({ ...data, body_md: e.target.value })}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <Button className="bg-emerald-800 rounded-full hover:bg-emerald-900">
            Save Draft
          </Button>
          <Button
            type="submit"
            className="bg-emerald-800 rounded-full hover:bg-emerald-900"
          >
            Post
          </Button>
        </div>
      </form>
    </div>
  );
}
