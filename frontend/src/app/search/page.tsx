'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSearch } from '@/services/user/search';
import { Post, Comment, Category } from '@/types/dashboard/post';
import { User } from '@/types/dashboard/user';
import { 
    PersonStanding, 
    House,
    PartyPopper,
    FileUser,
} from 'lucide-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from 'next/link';
import { Loader2, Circle } from 'lucide-react';

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

const categoryIcons: Record<string, React.ReactNode> = {
    "Community": <PersonStanding/>,
    "Recruit": <FileUser/>,
    "Events": <PartyPopper/>,
    "General": <House/>
};

function SearchResultCard({ item, type }: { item: Post | Comment | User | Category, type: 'post' | 'comment' | 'user' | 'category'}) {
    let href = '#';
    let title = '';
    let description = '';
    let author = '';
    let vote_score = 0;
    let comment_count = 0;
    let start_post = 0;
    let post_author = '';
    let post_comment_count = 0;
    let post_vote_score = 0;
    let post_when = 0;

    if (type === 'post') {
        const post = item as Post;
        href = `/posts/${post.id}?r=Search`;
        title = post.title;
        description = post.body_md;
        author = post.author_name;
        vote_score = post.vote_score;
        comment_count = post.comment_count;
        start_post = post.minutes_since_posted;
    } else if (type === 'comment') {
        const comment = item as Comment;
        post_author = comment.post_author_name;
        post_comment_count = comment.post_comment_count;
        post_vote_score = comment.post_vote_score;
        post_when = comment.post_minutes_since_posted;
        href = `/posts/${comment.post_id}?r=Search`;
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
    } else if (type === 'category'){
        const category = item as Category;
        href = `/posts/category/${category.id}`;
        title = category.label;
    }

    return (
        <Link href={href}>
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

                                    <div className="flex-1 flex flex-col text-sm gap-1">
                                        <span className="font-semibold">
                                            {author}
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
                                    <p className="text-xs text-gray-500 mt-2">{vote_score} {vote_score > 1 ? "votes" : "vote"}</p>
                                    <p className="text-xs text-gray-500 mt-2">{comment_count} {comment_count > 1 ? "comments" : "comment"}</p>
                                </div>
                            </div>

                        )}
                        {type === 'comment' && (
                            <div className='flex flex-col'>
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 border-3 border-emerald-600 dark:border-emerald-700">
                                        <AvatarImage
                                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${post_author}`}
                                        />
                                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
                                            {post_author.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 flex flex-col text-xs">
                                        <span className="font-semibold">
                                            {post_author}
                                        </span>
                                        <span className="text-gray-400">
                                            {formatTime(post_when)}
                                        </span>
                                    </div>
                                </div>
                                <CardTitle className="text-lg mb-2 mt-1">{title}</CardTitle>
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
                                        <p className="text-xs text-gray-500 mt-2">{vote_score} {vote_score > 1 ? "votes" : "vote"}</p>                                       
                                    </div>
                                </Card>
                                <div className='flex gap-2 mt-1'>
                                    <p className="text-xs text-gray-500 mt-2">{post_vote_score} {post_vote_score > 1 ? "votes" : "vote"}</p>
                                    <p className="text-xs text-gray-500 mt-2">{post_comment_count} {post_comment_count > 1 ? "comments" : "comment"}</p>
                                </div>
                            </div>
                        )}
                        {type === 'category' && (
                            <div className="flex mt-1 gap-3">

                                {(item as Category).color_hex ? (
                                    <Circle
                                        className="ml-1 mt-1 h-5 w-5 shrink-0 rounded-full text-white"
                                        style={{
                                            backgroundColor: (item as Category).color_hex ?? undefined,
                                        }}
                                    />
                                ) : (
                                    <div>
                                        {categoryIcons[(item as Category).label] ?? (
                                            <House/>
                                        )}
                                    </div>
                                )}

                                <span className="font-semibold">
                                    {title}
                                </span>
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
    data?: (Post | Comment | User | Category)[],
    type: 'post' | 'comment' | 'user' | 'category'
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
                return (
                    <div key={item.id} className="flex flex-col gap-1">
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
  data?: { posts: Post[]; comments: Comment[]; users: User[]; categories: Category[]; }
}) {
  if (!data) return null;

  const sections: { label: string; items: (Post | Comment | User | Category)[]; type: 'post' | 'comment' | 'user' | 'category' }[] = [
    { label: 'Posts', items: data.posts || [], type: 'post' },
    { label: 'Comments', items: data.comments || [], type: 'comment' },
    { label: 'Users', items: data.users || [], type: 'user' },
    { label: 'Categories', items: data.categories || [], type: 'category' },
  ];

  return (
    <div className="flex flex-col gap-8">
      {sections.map(section => section.items.length > 0 && (
        <div key={section.label} className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">{section.label}</h2>
          <div className="flex flex-col gap-2">
            {section.items.map(item => {
              return <SearchResultCard key={item.id} item={item} type={section.type} />;
            })}
          </div>
        </div>
      ))}
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
        (data?.users?.length || 0) +
        (data?.categories?.length || 0);

    return (
        <div className="w-full max-w-5xl mx-auto mt-10">
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="flex w-full overflow-x-auto md:grid md:grid-cols-5 no-scrollbar">
                    <TabsTrigger value="all" className="flex-shrink-0">All ({(total || 0)})</TabsTrigger>
                    <TabsTrigger value="categories" className="flex-shrink-0">Categories ({data?.categories?.length || 0})</TabsTrigger>
                    <TabsTrigger value="posts" className="flex-shrink-0">Posts ({data?.posts?.length || 0})</TabsTrigger>
                    <TabsTrigger value="comments" className="flex-shrink-0">Comments ({data?.comments?.length || 0})</TabsTrigger>
                    <TabsTrigger value="users" className="flex-shrink-0">Users ({data?.users?.length || 0})</TabsTrigger>                 
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

                <TabsContent value="categories" className="mt-4">
                     <SearchContent 
                        query={query} 
                        isLoading={isLoading} 
                        data={data?.categories} 
                        type="category" 
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