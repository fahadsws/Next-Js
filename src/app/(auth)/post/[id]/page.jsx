import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/api/prisma";
import { DateTime } from "luxon";
import { getServerSession } from "next-auth";
import Image from "next/image";

export default async function LinkedInPost({ params }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    const detail = await prisma.posts.findUnique({
        where: { id: Number(id) },
    });
    const formattedDate = new DateTime(detail.updated_at).toFormat('ccc LLL dd, hh:mm a')
    return (
        <div className="bg-[#f3f2ef] min-h-screen flex items-center justify-center p-4 w-100%">
            <div className="bg-white rounded-lg shadow-sm p-4 max-w-lg w-full">
                <div className="text-center text-gray-500 text-sm mb-2">
                    Published on {formattedDate}
                </div>

                <div className="flex items-center mb-4">
                    <Image
                        src={`${session?.user?.image}`}
                        alt="User Avatar"
                        width={40}
                        height={40}
                        className="rounded-full"
                        unoptimized
                    />
                    <div className="ml-3">
                        <h2 className="font-semibold text-gray-800">{session?.user?.name}</h2>
                        <p className="text-sm text-gray-500">
                            Growth at Typegrow | Helping you grow LinkedIn audience with AI
                        </p>
                        <p className="text-xs text-gray-400">7 days ago • 🌐</p>
                    </div>
                </div>

                <div className="text-gray-800 text-[15px] leading-6">
                    {detail?.content}
                </div>

                <div className="flex items-center justify-between text-gray-500 text-sm mt-4">
                    <div className="flex items-center space-x-1">
                        <span>👍❤️</span>
                        <span>57</span>
                    </div>
                    <div>
                        24 comments • 6 reposts
                    </div>
                </div>

                <hr className="my-3" />

                <div className="flex justify-around text-gray-600 text-sm">
                    <button className="flex items-center space-x-1 hover:text-black">
                        <span>👍</span> <span>Like</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-black">
                        <span>💬</span> <span>Comment</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-black">
                        <span>🔁</span> <span>Repost</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-black">
                        <span>✈️</span> <span>Send</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

