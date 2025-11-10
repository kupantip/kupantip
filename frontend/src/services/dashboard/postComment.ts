const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface Content {
  post_id: string
  parent_id: string;
  body_md: string;
}

export async function postComment(body: {
	content: Content;
}): Promise<boolean> {
  try {
    const res = await fetch(
      `${BACKEND_HOST}/comment?post_id=${body.content.post_id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body.content),
        credentials: "include",
      }
    );

    if (!res.ok) {
      let errorData: any = null;
      try {
        errorData = await res.json();
      } catch {
        errorData = { message: res.statusText };
      }

      throw {
        response: {
          status: res.status,
          data: errorData,
        },
      };
    }

    return true;
  } catch (err: any) {
    if (err.response) throw err;

    throw new Error(err.message || "Unexpected error occurred");
  }
}
