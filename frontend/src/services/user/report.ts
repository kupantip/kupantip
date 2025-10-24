const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

interface reportData {
  target_type: string;
  target_id: string;
  reason: string;
}

export async function Report(data: reportData){
    const res = await fetch(`${BACKEND_HOST}/report`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: "include"
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error("Report Post failed: " + JSON.stringify(errorData));
    }

    return res.json();
}