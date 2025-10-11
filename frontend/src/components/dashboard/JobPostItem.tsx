// JobPostItem.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface JobPostItemProps {
    id: string;
    title: string;
    type: string;
    department: string;
    location: string;
    time: string;
    postedBy: string;
    onApply?: () => void; // optional click handler for the Apply button
}

export const JobPostItem: React.FC<JobPostItemProps> = ({
    id,
    title,
    type,
    department,
    location,
    time,
    postedBy,
    onApply,
}) => {
    return (
        <div className="group py-4 px-6 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
            <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 group-hover:underline">
                    {title}
                </h3>
                <p className="text-sm text-gray-500">
                    <Badge variant="secondary" className="mr-2 bg-green-100 text-green-800">
                        {type}
                    </Badge>
                    {department} • {location} • {time}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                    Posted by {postedBy}
                </p>
            </div>
            <div>
                <Button
                    variant="outline"
                    className="text-green-1 border-green-1 hover:bg-green-50"
                    onClick={onApply}
                >
                    Apply
                </Button>
            </div>
        </div>
    );
};
