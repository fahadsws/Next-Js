import Image from "next/image";
import SideBar from "./SideBar";
import Link from "next/link";
import prisma from "@/lib/api/prisma";

export default async function MainWrapper({ slots, session }) {
    const posts = await prisma.posts.findMany({
        where: {
            author: session?.uniid,
        }
    });
    return (
        <>
            <div className="h-screen w-[450px] bg-white shadow-xl flex flex-col p-4">
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
                        <p className="text-base font-semibold">{session?.user?.name}</p>
                    </div>
                </Link>



                <div className="overflow-y-auto">
                    <SideBar slots={slots} posts={posts} />
                </div>
            </div>
        </>
    );
}
