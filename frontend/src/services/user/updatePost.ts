import { BanResponse } from "@/types/dashboard/user";

const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface updatePostData {
  title: string;
  body_md: string;
  category_id?: string;
  files: File[];
}

export async function updatePost(data: updatePostData, postID : string) {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("body_md", data.body_md);
    if (data.category_id) {
    formData.append("category_id", data.category_id);
    }

    data.files.forEach((file) => {
    formData.append("files", file);
    });

    const res = await fetch(`${BACKEND_HOST}/post/${postID}`, {
        method: "PUT",
        body: formData,
        credentials: "include"
    });

    if (!res.ok) {
        let errorData: BanResponse | null = null;
        errorData = (await res.json()) as BanResponse;
        const error = new Error(errorData?.message ?? "Failed to post comment");
        if (errorData) {
            (error as Error & BanResponse).reason = errorData.reason;
            (error as Error & BanResponse).end_at = errorData.end_at;
            (error as Error & BanResponse).status = res.status;
        }
        throw error;
    }

    return res.json();
}