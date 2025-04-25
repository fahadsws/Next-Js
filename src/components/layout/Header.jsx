'use client'
import { signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
export default function Header({ session }) {
    return (
        <>
            <header className="header">
                <div className="logo">
                    <Image src="/assets/Images/logo.jpg" alt="Typegrow" width={40} height={40} />
                </div>
                <div className="header-right">
                    <Link href="/" >Free Tools</Link>
                    {session ? (
                        <>
                            <Link href="/create" className="try-free-btn">Dashboard</Link>
                            <p onClick={() => signOut()} className=" bg-red-600 rounded-sm p-2 px-5 font-medium text-white">Log Out</p>
                        </>
                    ) : (
                        <>
                            <button onClick={() => signIn('linkedin')} className="cursor-pointer">Login</button>
                            <button onClick={() => signIn('linkedin')} className="try-free-btn cursor-pointer">Try for Free</button>
                        </>
                    )}
                </div>
            </header>
        </>
    )
}