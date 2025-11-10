const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface Content {
  post_id: string
  parent_id: string;
  body_md: string;
}

interface BackendError {
	message?: string;
	reason?: string;
	end_at?: string;
	status?: number;
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
			let errorData: BackendError | null = null;
			errorData = (await res.json()) as BackendError;
			const error = new Error(errorData?.message ?? "Failed to post comment");
			if (errorData) {
				(error as Error & BackendError).reason = errorData.reason;
				(error as Error & BackendError).end_at = errorData.end_at;
				(error as Error & BackendError).status = res.status;
			}
			throw error;
    }

    return true;
  } catch (err) {
		if (err instanceof Error) {
			throw err;
		}
		throw new Error(String(err));
  }
}
