'use client'
import { signIn } from "next-auth/react";
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
                    <Link href="/free-tools" >Free Tools</Link>
                    {session ? (
                        <>
                            <Link href="/create" className="try-free-btn">Dashboard</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/login">Login</Link>
                            <button onClick={() => signIn('linkedin')} className="try-free-btn">Try for Free</button>
                        </>
                    )}
                </div>
            </header>
        </>
    )
}