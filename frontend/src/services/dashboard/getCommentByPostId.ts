import * as t from '@/types/dashboard/post'
import { getSession } from 'next-auth/react'

const BACKEND_HOST = process.env.NEXT_PUBLIC_BACKEND_HOST

export async function getCommentByPostId(
    post_id: string
): Promise<t.CommentsResponse> {
    try {
        const res = await fetch(`${BACKEND_HOST}/comment?post_id=${post_id}`,{
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })

        if (!res.ok) {
            throw new Error(
                `Failed to fetch data: ${res.status} ${res.statusText}`
            )
        }

        const json: t.CommentsResponse = await res.json()
        return json
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message)
        } else {
            throw new Error(String(err))
        }
    }
}
