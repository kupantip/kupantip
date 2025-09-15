'use client'

import React, { useEffect, useState } from 'react'
import Post from '@/components/dashboard/post'
import { getPost } from '@/hooks/dashboard/getPost'
import * as t from '@/types/dashboard/post'

export default function DashboardPage() {
    const [postData, setPostData] = useState<t.Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const result = await getPost()
                setPostData(result)
                console.log(result)
            } catch (err: any) {
                setError(err.message || 'Failed to fetch data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="w-full flex gap-4 px-20 mt-10">
            <div className="w-4/5 flex flex-col gap-4">
                {postData.map((data) => (
                    <Post key={data.id} post={data} />
                ))}
            </div>

            {/* Right sidebar */}
            {/* <div className="w-1/5 bg-gray-50 p-4 rounded-lg">Right Bar</div> */}
        </div>
    )
}
