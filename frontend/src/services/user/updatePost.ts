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
        const errorData = await res.json();
        throw new Error("Update Post failed: " + JSON.stringify(errorData));
    }

    return res.json();
}