'use client'

import InnerPost from '@/components/dashboard/InnerPost'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import * as t from '@/types/dashboard/post'
import { getPostById } from '@/hooks/dashboard/getPostById'

export default function PostPage() {
    const params = useParams()
    const postId = Array.isArray(params.postId)
        ? params.postId[0]
        : params.postId

    const [post, setPost] = useState<t.Post[] | null>(null)

    useEffect(() => {
        console.log(postId);
        if (!postId) return

        const fetchPost = async () => {
            const data: t.Post[] = await getPostById(postId)
            setPost(data)
        }
        fetchPost()
    }, [postId])

    if (!post) return <p>Loading...</p>

    return <InnerPost post={post[0]} />
}
