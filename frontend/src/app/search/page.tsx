'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/services/user/search';
import { Post, Comment } from '@/types/dashboard/post';
import { User } from '@/types/dashboard/user';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const formatTime = (minutes: number) => {
	if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
	if (minutes < 1440)
		return `${Math.floor(minutes / 60)} hour${
			Math.floor(minutes / 60) !== 1 ? 's' : ''
		} ago`;
	return `${Math.floor(minutes / 1440)} day${
		Math.floor(minutes / 1440) !== 1 ? 's' : ''
	} ago`;
};

function SearchResultCard({ item, type }: { item: Post | Comment | User, type: 'post' | 'comment' | 'user' }) {
    let href = '#';
    let title = '';
    let description = '';
    let author = '';
    let vote_score = 0;
    let comment_count = 0;
    let start_post = 0;
    let relevance_score = 0;

    if (type === 'post') {
        const post = item as Post;
        href = `/posts/${post.id}`;
        title = post.title;
        description = post.body_md;
        author = post.author_name;
        vote_score = post.vote_score;
        comment_count = post.comment_count;
    } else if (type === 'comment') {
        const comment = item as Comment;
        href = `/posts/${comment.post_id}?highlight_comment=${comment.id}`; // (ส่งไปหน้า post และ highlight)
        title = comment.post_title;
        description = comment.body_md;
        author = comment.author_name;
        vote_score = comment.vote_score;
        start_post = comment.minutes_since_commented;
    } else if (type === 'user') {
        const user = item as User;
        href = `/profile/${user.id}`;
        title = user.display_name;
        description = `View profile for ${user.display_name}`;
        author = user.display_name;
        relevance_score = user.relevance_score;
    }

    return (
        <Link href={href} className="">
            <Card className="hover:bg-gray-100 py-4">
                <CardHeader>
                        {type === 'user' && (
                            <div className='mt-2'>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10 border-3 border-emerald-600 dark:border-emerald-700">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${author}`}
                                        />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
                                            {author.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 flex flex-col text-xs gap-1">
                                        <span className="font-semibold">
                                            {author}
                                        </span>
                                        <span className="text-gray-400">
                                            Relevance Score : {relevance_score}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {type === 'post' && (
                            <div className='flex flex-col gap-2'>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border-3 border-emerald-600 dark:border-emerald-700">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${author}`}
                                        />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
                                            {author.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 flex flex-col text-xs">
                                        <span className="font-semibold">
                                            {author}
                                        </span>
                                        <span className="text-gray-400">
                                            {formatTime(start_post)}
                                        </span>
                                    </div>
                                </div>
                                <CardTitle className="text-lg">{title}</CardTitle>
                                <CardDescription className="mt-1 line-clamp-2">
                                    {description}
                                </CardDescription>
                                <div className='flex gap-2'>
                                    <p className="text-xs text-gray-500 mt-2">{vote_score} votes</p>
                                    <p className="text-xs text-gray-500 mt-2">{comment_count} comments</p>
                                </div>
                            </div>

                        )}
                        {type === 'comment' && (
                            <div className='flex flex-col'>
                                <CardTitle className="text-lg mb-2">{title}</CardTitle>
                                <Card className="border-none shadow-none bg-gray-100 w-full p-4">
                                    <div className='flex flex-col gap-2'>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8 border-3 border-emerald-600 dark:border-emerald-700">
                                                <AvatarImage
                                                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${author}`}
                                                />
                                                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
                                                    {author.charAt(0).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 flex flex-col text-xs">
                                                <span className="font-semibold">
                                                    {author}
                                                </span>
                                                <span className="text-gray-400">
                                                    {formatTime(start_post)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <CardDescription className="mt-1 line-clamp-2 text-black">
                                            {description}
                                        </CardDescription>
                                        <p className="text-xs text-gray-500 mt-2">{vote_score} votes</p>                                       
                                    </div>
                                </Card>
                            </div>
                        )}
                </CardHeader>
            </Card>
        </Link>
    );
}

function SearchContent({ 
    query,
    isLoading,
    data,
    type,
    showTypeLabel
}: { 
    query: string | null,
    isLoading: boolean, 
    data?: (Post | Comment | User)[],
    type: 'post' | 'comment' | 'user'
    showTypeLabel?: boolean
}) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-500 py-16">
                No {type}s found for &quot;{query}&quot;
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {data.map(item => {
                const key = type === 'user' ? (item as User).user_id : (item as Post | Comment).id;
                return (
                    <div key={key} className="flex flex-col gap-1">
                        {showTypeLabel && (
                            <span className="text-xs font-semibold text-gray-500 uppercase">
                                {type}
                            </span>
                        )}
                        <SearchResultCard item={item} type={type} />
                    </div>
                )
            })}
        </div>
    );
}

function AllResults({ data }: { 
    data?: { posts: Post[]; comments: Comment[]; users: User[] }
}) {
    if (!data) return null;

    return (
        <div className="flex flex-col gap-8">

            {/* POSTS */}
            {data.posts?.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Posts</h2>
                    <div className="flex flex-col gap-2">
                        {data.posts.map(post => (
                            <SearchResultCard 
                                key={post.id} 
                                item={post} 
                                type="post" 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* COMMENTS */}
            {data.comments?.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Comments</h2>
                    <div className="flex flex-col gap-2">
                        {data.comments.map(comment => (
                            <SearchResultCard 
                                key={comment.id} 
                                item={comment} 
                                type="comment" 
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* USERS */}
            {data.users?.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold">Users</h2>
                    <div className="flex flex-col gap-2">
                        {data.users.map(user => (
                            <SearchResultCard 
                                key={user.user_id} 
                                item={user} 
                                type="user" 
                            />
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

function SearchPageComponent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');

    const { data, isLoading } = useSearch(query);

    const total =
        (data?.posts?.length || 0) +
        (data?.comments?.length || 0) +
        (data?.users?.length || 0);

    return (
        <div className="w-full max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">
                Search results for &quot;{query}&quot;
            </h1>

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All ({(total || 0)})</TabsTrigger>
                    <TabsTrigger value="posts">Posts ({data?.posts?.length || 0})</TabsTrigger>
                    <TabsTrigger value="comments">Comments ({data?.comments?.length || 0})</TabsTrigger>
                    <TabsTrigger value="users">Users ({data?.users?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    <AllResults data={data} />
                </TabsContent>
                
                <TabsContent value="posts" className="mt-4">
                    <SearchContent 
                        query={query} 
                        isLoading={isLoading} 
                        data={data?.posts} 
                        type="post" 
                    />
                </TabsContent>
                
                <TabsContent value="comments" className="mt-4">
                    <SearchContent 
                        query={query} 
                        isLoading={isLoading} 
                        data={data?.comments} 
                        type="comment" 
                    />
                </TabsContent>
                
                <TabsContent value="users" className="mt-4">
                     <SearchContent 
                        query={query} 
                        isLoading={isLoading} 
                        data={data?.users} 
                        type="user" 
                    />
                </TabsContent>

            </Tabs>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SearchPageComponent />
        </Suspense>
    );
}