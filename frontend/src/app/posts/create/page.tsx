"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { createPost } from "@/services/user/create-post_page";
import { useCategories } from '@/services/post/category';
import { motion } from "framer-motion";
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreatePostPage() {
  const [tab, setTab] = useState<"text" | "media">("text");
  const [formData, setFormData] = useState({
    title: "",
    body_md: "",
    url: "",
    category_id: "",
    files: [] as File[],
  });

  const { data: categories } = useCategories();

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
        AOS.init({
            duration: 500,
            once: true,
            offset: 80,
        });
    }, []);

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

  const handleSelectCategory = (value : string) => {
    setFormData({ ...formData, category_id: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const postId = uuidv4();
    const postUrl = `http://post/${postId}`;

    try {
      await createPost({ ...formData, url: postUrl });
      router.push(`/posts/category/${formData.category_id}`);
    } catch (err: unknown) {
      console.error("Error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      data-aos="fade-up"
      className="flex justify-center items-start min-h-screen bg-white p-8">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Post</h1>

        <div className="flex gap-6 border-b mb-6">
          {["text", "media"].map((type) => (
            <button
              key={type}
              onClick={() => setTab(type as "text" | "media")}
              className={`relative pb-2 font-medium transition-colors ${
                tab === type
                  ? "text-emerald-700 p-2 hover:bg-gray-100 cursor-pointer"
                  : "text-gray-500 p-2 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {type === "text" ? "Text" : "Images & Video"}
              {tab === type && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-700 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Enter your post title..."
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            required
          />

          <Select
            onValueChange={handleSelectCategory}
            value={formData.category_id}
          >
            <SelectTrigger className="border border-gray-300 rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {tab === "text" ? (
            <textarea
              placeholder="Write something interesting..."
              value={formData.body_md}
              onChange={(e) =>
                setFormData({ ...formData, body_md: e.target.value })
              }
              className="border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-700"
              rows = {10}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-16 text-center transition-colors ${
                  isDragActive
                    ? "bg-emerald-50 border-emerald-400"
                    : "border-gray-300 hover:border-emerald-500"
                } cursor-pointer`}
              >
                <input {...getInputProps()} />
                {formData.files.length === 0 ? (
                  <p className="text-gray-500">
                    {isDragActive
                      ? "Drop your files here..."
                      : "Drag & drop images/videos, or click to upload"}
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {formData.files.map((file, i) => (
                      <div key={i} className="relative group">
                        {file.type.startsWith("image/") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            className="rounded-lg object-cover h-32 w-full"
                          />
                        ) : (
                          <video
                            src={URL.createObjectURL(file)}
                            controls
                            className="rounded-lg object-cover h-32 w-full"
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
                          className="absolute top-2 right-2 bg-black/50 text-white rounded-full px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                placeholder="Add a caption or description..."
                value={formData.body_md}
                onChange={(e) =>
                  setFormData({ ...formData, body_md: e.target.value })
                }
                className="border border-gray-300 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-700"
                rows={10}
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-700 hover:bg-emerald-800 hover:shadow-md hover:scale-105 p-8 py-2 rounded-full cursor-pointer"
            >
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}