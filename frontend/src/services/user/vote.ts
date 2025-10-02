const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

export async function upvotePost(postId: string) {
  const res = await fetch(`${BACKEND_HOST}/post-vote/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ value: 1 }),
  });

  if (!res.ok) {
    throw new Error(`Failed to upvote: ${res.status}`);
  }

  return res.json();
}

export async function downvotePost(postId: string) {
  const res = await fetch(`${BACKEND_HOST}/post-vote/${postId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ value: -1 }),
  });

  if (!res.ok) {
    throw new Error(`Failed to downvote: ${res.status}`);
  }

  return res.json();
}

export async function deletevotePost(postId: string) {
  const res = await fetch(`${BACKEND_HOST}/post-vote/${postId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to downvote: ${res.status}`);
  }

  return res.json();
}