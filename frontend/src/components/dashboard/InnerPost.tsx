'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MessageSquare, ArrowUp, ArrowDown, Ellipsis } from 'lucide-react'
import * as t from '@/types/dashboard/post'
import { getCommentByPostId } from '@/hooks/dashboard/getCommentByPostId'
import { Input } from '@/components/ui/input'
import CommentBox from './CommentBox'

type PostProps = {
    post: t.Post
}

const daySincePosted = (minutes: number) => {
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60)
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
        const days = Math.floor(minutes / 1440)
        return `${days} day${days !== 1 ? 's' : ''} ago`
    }
}

export default function InnerPost({ post }: PostProps) {
    const [commentsData, setCommentsData] = useState<t.CommentsResponse | null>(
        null
    )
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        const fetchComments = async () => {
            try {
                const data = await getCommentByPostId(post.id)
                setCommentsData(data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        fetchComments()
    }, [])

    if (loading) return <p>Loading comments...</p>

    const handlePost = () => console.log('Click on a post:', post.id)
    const handleUpVote = (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('Upvote on:', post.id)
    }
    const handleDownVote = (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('Downvote on:', post.id)
    }
    const toggleComments = (e: React.MouseEvent) => {
        e.stopPropagation()
        // setShowComments(!showComments)
    }

    return (
        <div className="flex flex-col items-center">
            {/* Post */}
            <div
                className="w-[100vw] max-w-2xl rounded-md hover:bg-gray-50 px-4 py-3 cursor-pointer m-10"
                onClick={handlePost}
            >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 px-3 pt-1">
                    <Avatar className="w-8 h-8">
                        <AvatarImage
                            src="/chicken.png"
                            alt={post.author_name}
                        />
                        <AvatarFallback>
                            {post.author_name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-sm">
                        <span className="font-semibold">
                            {post.author_name}
                        </span>
                        <span className="text-gray-500">
                            {daySincePosted(post.minutes_since_posted)}
                        </span>
                    </div>
                    <button className="ml-auto p-1 rounded hover:bg-gray-200">
                        <Ellipsis />
                    </button>
                </div>

                {/* Post content */}
                <div className="text-base font-medium mb-2">{post.title}</div>
                {post.attachments.length > 0 && (
                    <div className="mb-2 rounded overflow-hidden">
                        <img
                            src={post.attachments[0].url}
                            alt="Post attachment"
                            className="w-full h-auto object-cover"
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                        <ArrowUp
                            className="w-5 h-5 p-1 rounded hover:bg-gray-200"
                            onClick={handleUpVote}
                        />
                        <span>{post.vote_count}</span>
                        <ArrowDown
                            className="w-5 h-5 p-1 rounded hover:bg-gray-200"
                            onClick={handleDownVote}
                        />
                    </div>

                    <div
                        className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                        onClick={toggleComments}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comment_count} comments</span>
                    </div>
                </div>
            </div>

            {/* CommentBox centered */}
            <CommentBox className="w-full max-w-2xl mb-4" />

            {/* Comments section centered */}
            <div className="w-full max-w-2xl border-l border-gray-200 pl-5 mt-2">
                {!commentsData ? (
                    // Still render a placeholder if we haven’t loaded comments yet
                    <p className="text-gray-500 text-sm italic">
                        No comments yet.
                    </p>
                ) : commentsData.comments.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                        No comments yet.
                    </p>
                ) : (
                    commentsData.comments.map((comment) => (
                        <div key={comment.id} className="mb-2">
                            <div className="flex items-center gap-2 text-sm mb-1">
                                <span className="font-semibold">
                                    {comment.author_name}
                                </span>
                                <span className="text-gray-400 text-xs">
                                    {daySincePosted(1000)}
                                </span>
                            </div>
                            <div className="text-sm">{comment.body_md}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
