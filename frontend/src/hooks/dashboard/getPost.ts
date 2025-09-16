import * as t from '@/types/dashboard/post'

const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST

export async function getPost(): Promise<t.Post[]> {
    try {
        const res = await fetch(
            `${BACKEND_HOST}/post`
        )

        if (!res.ok) {
            throw new Error(
                `Failed to fetch data: ${res.status} ${res.statusText}`
            )
        }

        const json: t.Post[] = await res.json()
        return json
        
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message)
        } else {
            throw new Error(String(err))
        }
    }
}
