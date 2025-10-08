import { Button } from "@/components/ui/button";

interface PostItemProps {
    title: string;
    author: string;
    time: string;
    comments?: number;
}

export const PostItem: React.FC<PostItemProps> = ({ title, author, time, comments = 0 }) => {
    return (
        <div className="py-4 px-6 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
            <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 hover:underline">
                    {title}
                </h3>
                <p className="text-sm text-gray-500">
                    {author} • {time}
                </p>
            </div>
            <Button className="flex items-center text-gray-400 cursor-pointer bg-grey-3 hover:bg-grey-2">
                💬 <span className="ml-1 text-sm">{comments}</span>
            </Button>
        </div>
    );
};
