const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface CreatePostData {
  title: string;
  body_md: string;
  url: string;
  category_id: string;
  files: File[];
}

export async function createPost(data: CreatePostData) {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("body_md", data.body_md);
  formData.append("url", data.url);
  if (data.category_id) {
    formData.append("category_id", data.category_id);
  }

  data.files.forEach((file) => {
    formData.append("files", file);
  });

  const res = await fetch(`${BACKEND_HOST}/post`, {
    method: "POST",
    body: formData,
    credentials: "include"
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error("Create Post failed: " + JSON.stringify(errorData));
  }

  return res.json();
}
