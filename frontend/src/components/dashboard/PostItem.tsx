"use client"; // required because we use client-side interactivity

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PostItemProps {
    id: string;
    title: string;
    author: string;
    time: number; // time in minutes
    comments?: number;
}

export const PostItem: React.FC<PostItemProps> = ({ id, title, author, time, comments = 0 }) => {
    const formatTime = (minutes: number) => {
        if (minutes < 60) return `${minutes} min ago`;
        if (minutes < 60 * 24) return `${Math.floor(minutes / 60)} hr${Math.floor(minutes / 60) > 1 ? "s" : ""} ago`;
        return `${Math.floor(minutes / (60 * 24))} day${Math.floor(minutes / (60 * 24)) > 1 ? "s" : ""} ago`;
    };

    return (
        <Link href={`/dashboard/${id}`} className="block">
            <div className="py-4 px-6 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 hover:underline">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500">
                        {author} • {formatTime(time)}
                    </p>
                </div>
                <Button
                    onClick={(e) => e.stopPropagation()} // prevents Link navigation
                    className="flex items-center text-gray-400 cursor-pointer bg-grey-3 hover:bg-grey-2"
                >
                    💬 <span className="ml-1 text-sm">{comments}</span>
                </Button>
            </div>
        </Link>
    );
};
