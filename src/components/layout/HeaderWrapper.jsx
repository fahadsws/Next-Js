import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Header from "./Header";

export default async function HeaderWrapper() {
    const session = await getServerSession(authOptions);
    return <Header session={session} />;
}
