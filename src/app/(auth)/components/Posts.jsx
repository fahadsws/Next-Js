import { DateTime } from "luxon";

export default function Posts({ posts }) {
    const truncateContent = (content, limit = 20) => {
        if (content.length <= limit) return content;
        return content.slice(0, limit) + "…";
    };
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
                    <div key={post.id} className="p-4 bg-white rounded shadow-sm">
                        <div className="text-sm text-gray-500 mb-1">
                            {dt.isValid ? dt.toFormat("ccc LLL dd, hh:mm a") : "Invalid date"}
                        </div>
                        <p className="text-gray-800 text-sm whitespace-pre-line">
                            {truncateContent(post.content)}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
