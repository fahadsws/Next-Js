'use client';
import { useState } from "react";
import Slots from "./Slots";
import Posts from "./Posts";

export default function SideBar({ slots, posts }) {
    const [tab, setTab] = useState(1);

    return (
        <>
            <div className="flex space-x-6 mb-6">
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
                            {label}
                        </button>
                    );
                })}
            </div>
            <button className="flex items-center space-x-2 text-blue-600 font-semibold mb-4 hover:text-blue-700 transition-all duration-200">
                <span className="text-xl">＋</span>
                <span>New Post</span>
            </button>

            <div className="transition-opacity duration-300 ease-in-out opacity-100 animate-fadeIn">
                {tab === 1 && <Slots slots={slots} />}
                {tab === 3 && <Posts posts={posts} />}
            </div>
        </>
    );
}