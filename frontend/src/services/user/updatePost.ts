const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface updatePostData {
  title: string;
  body_md: string;
  category_id: string;
}

export async function updatePost(data: updatePostData, postID : string) {
    const res = await fetch(`${BACKEND_HOST}/post/${postID}`, {
        method: "PUT",
        headers : {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: "include"
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error("Update Post failed: " + JSON.stringify(errorData));
    }

    return res.json();
}