const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

export async function deletePost(postId: string) {
  const res = await fetch(`${BACKEND_HOST}/post/${postId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete post");
  }

  return await res.json();
}
