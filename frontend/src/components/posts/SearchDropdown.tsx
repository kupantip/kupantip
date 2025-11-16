'use client';

import { Loader2 } from 'lucide-react';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search } from "lucide-react"
import { SearchResponse } from '@/types/dashboard/user';

export default function InstantSearchDropdown ({
    isLoading,
    data,
    onResultClick,
	SearchItem
}: {
    isLoading: boolean;
    data: SearchResponse | undefined;
    onResultClick: () => void;
	SearchItem: string;
}) {
    const hasResults = (data?.posts?.length || 0) > 0 || (data?.comments?.length || 0) > 0 || (data?.users?.length || 0) > 0;

    return (
        <div className="absolute top-full mt-2 w-full max-w-xl bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            {isLoading ? (
                <div className="p-4 flex justify-center items-center">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                </div>
            ) : !hasResults ? (
                <div className="p-4 text-center text-sm text-gray-500">
                    No results found.
                </div>
            ) : (
                <div className="max-h-[60vh] overflow-y-auto">
                    {data?.posts && data.posts.length > 0 && (
                        <div className="p-2">
                            <h4 className="text-xs font-semibold uppercase text-gray-500 px-3 pt-2">Posts</h4>
                            <ul>
                                {data.posts.slice(0, 3).map(post => (
                                    <li key={post.id}>
                                        <Link 
                                            href={`/search?q=${encodeURIComponent(SearchItem.trim())}`} 
                                            onClick={onResultClick}
                                            className="flex items-start gap-3 w-full text-left p-3 rounded-md hover:bg-gray-100"
                                        >
											<Search className="text-gray-600 w-5"/>
											<div>
												<p className="font-medium text-black line-clamp-1">{post.title}</p>
											</div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {data?.comments && data.comments.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <h4 className="text-xs font-semibold uppercase text-gray-500 px-3 pt-2">Comments</h4>
                            <ul>
                                {data.comments.slice(0, 3).map(comment => (
                                    <li key={comment.id}>
                                        <Link 
                                            href={`/search?q=${encodeURIComponent(SearchItem.trim())}`} 
                                            onClick={onResultClick}
                                            className="flex items-start gap-3 w-full text-left p-3 rounded-md hover:bg-gray-100"
                                        >	
											<Search className='text-gray-600 w-5'/>
											<div className=''>
												<p className="font-medium text-black line-clamp-1">{comment.body_md}</p>
											</div>

                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {data?.users && data.users.length > 0 && (
                        <div className="p-2 border-t border-gray-100">
                            <h4 className="text-xs font-semibold uppercase text-gray-500 px-3 pt-2">Users</h4>
                            <ul>
                                {data.users.slice(0, 3).map(user => (
                                    <li key={user.id}>
                                        <Link 
                                            href={`/search?q=${encodeURIComponent(SearchItem.trim())}`} 
                                            onClick={onResultClick}
                                            className="flex items-start gap-3 w-full text-left p-3 rounded-md hover:bg-gray-100"
                                        >	
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-10 h-10 border-3 border-emerald-600 dark:border-emerald-700">
                                                    <AvatarImage
                                                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.display_name}`}
                                                    />
                                                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xl">
                                                        {user.display_name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1 flex flex-col text-xs gap-1">
                                                    <span className="font-semibold">
                                                        {user.display_name}
                                                    </span>
                                                    <span className="text-gray-400">
                                                        Relevance Score : {user.relevance_score}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};