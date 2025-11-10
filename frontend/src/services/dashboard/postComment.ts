import { BanResponse } from "@/types/dashboard/user";

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

    return true;
  } catch (err) {
		if (err instanceof Error) {
			throw err;
		}
		throw new Error(String(err));
  }
}
