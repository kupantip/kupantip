const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

export async function deleteComment(commentId: string) {
  const res = await fetch(`${BACKEND_HOST}/comment/${commentId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete comment");
  }

  return await res.json();
}
