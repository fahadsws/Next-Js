import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/lib/api/prisma";
import MainWrapper from "./components/MainWrapper";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);
  const slots = await prisma.slots.findMany({
    where: {
      user_id: session?.uniid,
      is_schedule: 0,
    }
  });
  return (
    <>
     <main className="flex w-full overflow-x-hidden h-screen">
      <MainWrapper slots={slots} session={session} />
      <div className="textformater w-full overflow-y-auto">
        {children}
      </div>
    </main>
    </>
  );
}
