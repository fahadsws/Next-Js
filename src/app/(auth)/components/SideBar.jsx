'use client';
import { useState } from "react";
import Slots from "./Slots";
import Posts from "./Posts";
import Link from "next/link";
import Draft from "./Draft";

export default function SideBar({ slots, posts, user_id, draftPosts, notPosts,notPosted }) {
    const [tab, setTab] = useState(1);
    const truncateContent = (content, limit = 20) => {
        if (content.length <= limit) return content;
        return content.slice(0, limit) + "…";
    };
    return (
        <>
            <div className="flex space-x-6 mb-6 justify-between">
                {["Queue", "Drafts", "Posted"].map((label, index) => {
                    const tabIndex = index + 1;
                    return (
                        <button
                            key={label}
                            onClick={() => setTab(tabIndex)}
                            className={`pb-2 transition-all duration-300 text-sm ${tab === tabIndex
                                ? 'border-b-2 border-blue-600 text-blue-600 font-semibold'
                                : 'text-gray-600 hover:text-blue-600'
                                }`}
                        >
                            {label} {label == 'Queue' && <span className="text-xs text-gray-400">({notPosted.length})</span>}
                        </button>
                    );
                })}
            </div>
            <Link href='/create' className="flex items-center space-x-2 text-blue-600 font-semibold mb-4 hover:text-blue-700 transition-all duration-200">
                <span className="text-xl">＋</span>
                <span>New Post</span>
            </Link>

            <div className="transition-opacity duration-300 ease-in-out opacity-100 animate-fadeIn">
                {tab === 1 && <Slots slots={slots} user_id={user_id} notPosts={notPosts} truncateContent={truncateContent} />}
                {tab === 2 && <Draft posts={draftPosts} truncateContent={truncateContent} />}
                {tab === 3 && <Posts posts={posts} truncateContent={truncateContent} />}
            </div>
        </>
    );
}