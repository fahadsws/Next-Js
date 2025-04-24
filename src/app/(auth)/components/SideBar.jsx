'use client'

import SlotModal from "@/components/layout/SlotModal";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function SideBar({ slots }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();
    return (
        <>
            <div className="h-screen w-95 bg-white shadow-xl flex flex-col justify-center">
                <div className="p-6 text-2xl font-bold border-b border-gray-100">
                    {session && (
                        <div className="pb-6 col-span-full md:pb-0 md:col-span-6">
                            <a href="/" className="flex justify-center space-x-3 md:justify-start">
                                <Image
                                    src={`${session?.user?.image}`}
                                    alt="User Avatar"
                                    width={30}
                                    height={30}
                                    className="rounded-full"
                                    unoptimized
                                />
                                <p className="self-center text-sm
 font-bold">{session?.user?.name}</p>
                            </a>
                        </div>
                    )}
                </div>
                <nav className="flex-1 p-4">
                    <ul className="space-y-4">
                        <li className="flex gap-1">
                            <button onClick={() => setIsOpen(true)} className="text-white relative text-sm z-0 rounded bg-blue-500 font-bold px-10 py-3 transition-[all_0.3s_ease] after:absolute after:left-0 after:top-0 after:-z-10 after:h-full after:w-0 after:rounded after:bg-blue-900 after:transition-[all_0.3s_ease]  hover:after:w-full ">
                                Add Schedule
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>

            {isOpen && (
                <SlotModal setIsOpen={setIsOpen} slots={slots} />
            )}
        </>
    );
}


