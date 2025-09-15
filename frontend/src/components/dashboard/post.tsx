'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    MessageSquare,
    Share2,
    Heart,
    ArrowUp,
    ArrowDown,
    Ellipsis,
} from 'lucide-react'
import { Button } from '../ui/button'

export default function Post() {
    const handlePost = async () => {
        console.log('Click on a post')
    }

    const handleUpVote = async (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('Upvote')
    }

    const handleDownVote = async (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('Downvote')
    }

    const handleOpenComment = async (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('Comment')
    }

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation()
        console.log('Share')
    }

    return (
        <Card
            className="w-full max-w-md border rounded-lg shadow-sm hover:bg-gray-100"
            onClick={handlePost}
        >
            {' '}
            {/* Header */}
            <CardHeader className="flex flex-row items-center gap-2 p-3 py-1">
                <Avatar className="w-8 h-8">
                    <AvatarImage src="/chicken.png" alt="@chickenlady" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                        r/countwithchickenlady
                    </span>
                    <span className="text-xs text-gray-500">5 hr. ago</span>
                </div>
                <button className="ml-auto bg-purple-2 text-white text-xs px-3 py-1 rounded-lg hover:bg-purple-1">
                    Join
                </button>

                <button className="bg-white ml-2 p-1 rounded hover:bg-gray-100">
                    <Ellipsis />
                </button>
            </CardHeader>
            {/* Content */}
            <CardContent className="px-3 pb-1">
                <div className="text-base font-medium mb-2">14936</div>
                <div className="border rounded-md overflow-hidden">
                    <img
                        src="/dashboard/mock.png"
                        alt="Post content"
                        className="w-full h-auto object-cover"
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-1 items-center text-sm text-gray-600 pt-3">
                    <div className="flex items-center gap-1 bg-gray-200 p-[1%] rounded-xl">
                        <ArrowUp
                            className="w-6 h-6 p-1 rounded-full border-gray-200 border-1 hover:bg-gray-300"
                            onClick={handleUpVote}
                        />
                        <span>3.1k</span>
                        <ArrowDown
                            className="w-6 h-6 p-1 rounded-full border-gray-200 border-1 hover:bg-gray-300"
                            onClick={handleDownVote}
                        />
                    </div>
                    <div
                        className="flex items-center gap-1 bg-gray-200 p-[2%] rounded-xl hover:bg-gray-300"
                        onClick={handleOpenComment}
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>187</span>
                    </div>
                    <div
                        className="flex items-center gap-1 bg-gray-200 p-[2%] rounded-xl hover:bg-gray-300"
                        onClick={handleShare}
                    >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
