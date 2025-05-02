import { draftPost } from "@/store/useStores";
import { DateTime } from "luxon";
import { useState } from "react";
import DeleteModel from "./DeleteModel";

export default function Draft({ posts, truncateContent }) {
    const { setDraftPost } = draftPost();
    const [deleteModel, setDeleteModel] = useState(false);
    const [selectedpost, setSelectedPost] = useState(false);

    const handleDraftClick = (post) => {
        setDraftPost({
            id: post.id,
            content: post.content,
        });
    }
    return (
        <div className="space-y-4 shadow-2xl">
            {posts && posts.length > 0 ? (
                posts.map((post, index) => {
                    let dt;
                    if (typeof post.created_at === "string") {
                        dt = DateTime.fromFormat(post.created_at, "yyyy-MM-dd HH:mm:ss");
                    } else {
                        dt = DateTime.fromJSDate(new Date(post.created_at));
                    }
                    return (
                        <div onClick={() => handleDraftClick(post)} key={index} className="flex justify-between p-4 cursor-pointer rounded border border-gray-100">
                            <div className="">
                                <div className="text-sm text-gray-500 mb-1">
                                    {dt && dt.isValid ? dt.toFormat("ccc LLL dd, hh:mm a") : "No date"}
                                </div>
                                <p className="text-gray-800 text-sm whitespace-pre-line">
                                    {truncateContent(post.content)}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedPost({ id: post.id });
                                    setDeleteModel(true);
                                }}
                                className="p-2 rounded bg-red-200 h-8 hover:bg-red-00"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 text-red-600"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M6 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1zm4 1a1 1 0 10-2 0v6a1 1 0 102 0V8z"
                                        clipRule="evenodd"
                                    />
                                    <path d="M4 5a1 1 0 011-1h10a1 1 0 011 1v1H4V5zM5 7h10l-.867 10.142A1 1 0 0113.138 18H6.862a1 1 0 01-.995-.858L5 7z" />
                                </svg>
                            </button>
                        </div>
                    );
                })
            ) : (
                <p className="text-gray-500 text-sm">No drafts found.</p>
            )}

            {deleteModel && <DeleteModel
                tittle={'Delete post'}
                desc={'Are you sure you want to delete your scheduled post?'}
                color={'red'}
                post={selectedpost}
                onClose={() => setDeleteModel(false)}
            />}
        </div>
    );
}
