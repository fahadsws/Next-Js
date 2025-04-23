import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
export default async function Header() {
    const session = await getServerSession(authOptions);
    return (
        <>
            <header className="header">
                <div className="logo">
                    <Image src="/assets/images/logo.png" alt="Typegrow" width={40} height={40} />
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