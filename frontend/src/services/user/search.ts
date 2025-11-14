const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST;

export async function Search(){
    const res = await fetch(`${BACKEND_HOST}/search`, {
        method: "GET"
    })

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error("Search failed: " + JSON.stringify(errorData));
    }

    return res.json();
}