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
        const errorData = await res.json();
        throw new Error("Update Comment failed: " + JSON.stringify(errorData));
    }

    return res.json();
}