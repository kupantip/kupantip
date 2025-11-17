import { BanResponse } from "@/types/dashboard/user";

const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface updateCommentData {
    id: string;
    body_md: string;
}

export async function updateComment(data: updateCommentData) {
    const body = {
        body_md: data.body_md,
    };

    const res = await fetch(`${BACKEND_HOST}/comment/${data.id}`, {
        method: "PUT",
        headers : {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
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