"use client";

import { use, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import adminApi from "@/lib/adminApi";
import BlogEditor from "@/components/admin/blog/BlogEditor";

export default function EditBlogPage({ params }) {
  const { id } = use(params);
  const [blog, setBlog] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminApi
      .get(`/blogs/${id}`)
      .then(({ data }) => {
        if (!cancelled) setBlog(data.data.blog);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load this insight.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>;
  }

  if (!blog) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#37469E]" />
      </div>
    );
  }

  // Keyed by id so navigating between two posts remounts the editor — Quill is
  // seeded once on mount and would otherwise keep the previous post's body.
  return <BlogEditor key={blog.id} blogId={blog.id} initial={blog} />;
}
