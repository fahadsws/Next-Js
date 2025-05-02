import { DateTime } from "luxon";
import Link from "next/link";

export default function Posts({ posts, truncateContent }) {
    return (
        <div className="space-y-4">
            {posts?.map((post) => {
                let dt;

                if (typeof post.created_at === "string") {
                    dt = DateTime.fromFormat(post.created_at, "yyyy-MM-dd HH:mm:ss");
                } else {
                    dt = DateTime.fromJSDate(new Date(post.created_at));
                }

                return (
                    <Link href={`/post/${post.id}`} key={post.id} className="p-4 rounded">
                        <div className="text-sm text-gray-500 mb-1">
                            {dt.isValid ? dt.toFormat("ccc LLL dd, hh:mm a") : "Invalid date"}
                        </div>
                        <p className="text-gray-800 text-sm whitespace-pre-line">
                            {truncateContent(post.content)}
                        </p>
                    </Link>
                );
            })}
        </div>
    );
}
