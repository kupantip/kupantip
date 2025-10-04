'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Post } from '@/types/dashboard/post';
import { getPostById } from '@/hooks/dashboard/getPostById';
import { updatePost } from '@/services/user/updatePost';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams() as { postId: string };
    const postId = params.postId;

    const [post, setPost] = useState<Post | null>(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category_id, setCategoryid] = useState('');

    useEffect(() => {
        async function fetchPost() {
            try {
                const fetchedPosts: Post[] = await getPostById(postId);
                if (fetchedPosts.length === 0) {
                    console.error('Post not found');
                return;
                }

                const fetchedPost = fetchedPosts[0]; // เอาโพสต์แรก
                setPost(fetchedPost);
                setTitle(fetchedPost.title);
                setBody(fetchedPost.body_md || '');
                setCategoryid(fetchedPost.category_id || '');
            } catch (err) {
                console.error('Failed to fetch post', err);
            }
        }
        fetchPost();
    }, [postId]);

    const handleSubmit = async () => {
        if (!post) return;
        try {
            await updatePost({ title, body_md: body, category_id }, post.id);
            router.push(`/dashboard`);
        } catch (err) {
            console.error('Failed to update post', err);
        }
    };

    if (!post) return <div>Loading...</div>;

    return (
        <div className="flex flex-col">
            <h1 className="text-3xl font-bold mb-4">Edit Post</h1>
            <div className="flex flex-col gap-4 w-[100vw] max-w-2xl">
                <input
                    className="border rounded-xl p-3"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Title"
                    required
                />
                <select
                    className="border rounded-xl p-3"
                    value={category_id}
                    onChange={e => setCategoryid(e.target.value)}
                >
                    <option value="">Select Category</option>
                </select>
                <textarea
                    className="border rounded-xl p-3"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    placeholder="Body text (optional)"
                    rows={10}
                />
                <div className='flex justify-end gap-2'>
                    <Link href="/dashboard">
                        <Button
                            className="bg-gray-200 text-black rounded-full hover:bg-gray-300 cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type='submit'
                        onClick={handleSubmit}
                        className="bg-emerald-800 rounded-full hover:bg-emerald-900 cursor-pointer"
                    >
                        Save
                    </Button>
                </div>
            </div>    
        </div>
    );
}