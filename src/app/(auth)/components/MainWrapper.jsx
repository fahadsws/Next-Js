import Image from "next/image";
import SideBar from "./SideBar";
import Link from "next/link";
import prisma from "@/lib/api/prisma";
import { getNextFreeSlot } from "@/lib/actions/post";

export default async function MainWrapper({ slots: slot, session }) {
    const posts = await prisma.posts.findMany({
        where: {
            author: session?.uniid,
        },
    });
    const draftPosts = posts.filter(post => post.is_draft == 1);
    const posted = posts.filter(post => post.is_post == 1 && post.is_draft == 0);

    const notPosts = posts.filter(post => post.is_post === 0 && post.is_draft === 0);

    const result = await prisma.$queryRaw`
    SELECT 
        s.*, 
        p.*
    FROM 
        \`slots\` s
    LEFT JOIN 
        \`posts\` p ON s.id = p.\`is_slot\`
    WHERE 
        p.\`is_post\` = 0 OR p.\`is_post\` IS NULL
    ORDER BY 
        s.\`time\` ASC;
`;
    const notPostsWithSlots = result.map(slot => {
        return {
            ...slot,
            post: slot.id ? { ...slot } : null,
        };
    });
    return (
        <>
            <div className="h-screen w-[360px] bg-white shadow-xl flex flex-col p-4">
                <Link href='/'>
                    <div className="flex items-center space-x-3 border-b border-gray-100 pb-4 mb-4">
                        <Image
                            src={session?.user?.image}
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="rounded-full"
                            unoptimized
                        />
                        <div className="">
                            <p className="text-base font-semibold">{session?.user?.name}</p>
                        </div>
                    </div>
                </Link>
                <div className="overflow-y-auto">
                    <SideBar slots={slot} user_id={session?.uniid} posts={posted} draftPosts={draftPosts} notPosts={notPostsWithSlots} notPosted={notPosts} />
                </div>
            </div>
        </>
    );
}
